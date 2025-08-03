// social-blogging-app/backend/src/controllers/auth.js
import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js"; // Assuming generateToken is in auth.js middleware
import bcrypt from "bcrypt"; // You might need this for password hashing on signup, if not handled by mongoose pre-save hook

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const user = new User({ firstName, lastName, email, password });
    // The pre('save') hook in your User model should handle password hashing here
    await user.save();

    res.status(201).json({
      msg: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture, // Include profilePicture on signup response
        // Only include fields you want to send back immediately
      },
      token: generateToken(user._id), // Optionally return token directly on signup
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture, // <-- Ensure profilePicture is returned on login
        // bio: user.bio, // Add these if you want them immediately after login
        // postsCount: user.postsCount,
        // followersCount: user.followersCount,
        // followingCount: user.followingCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (requires token, handled by protect middleware)
export const getProfile = async (req, res) => {
  // <-- ENSURE THIS IS PRESENT AND EXPORTED
  // The 'protect' middleware has already found the user by ID
  // and attached the user object to req.user.
  // We can directly access the user's properties from req.user.
  // If you need to ensure the most up-to-date data, you could re-fetch:
  // const user = await User.findById(req.user._id).select('-password');
  // For now, let's assume req.user has what we need as protect already fetched it.

  if (req.user) {
    res.json({
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      profilePicture: req.user.profilePicture, // <-- Crucial for Dashboard
      bio: req.user.bio, // Add these as they might be used later for profile
      postsCount: req.user.postsCount,
      followersCount: req.user.followersCount,
      followingCount: req.user.followingCount,
    });
  } else {
    res.status(404).json({ msg: "User not found" });
  }
};

// @desc    (INSECURE DEMO) Verify if an email exists for password reset
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found with that email." });
    }

    res.status(200).json({ msg: "Email verified." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// @desc    (INSECURE DEMO) Update a user's password directly after email verification
// @route   POST /api/auth/reset-password-unsecured
// @access  Public
export const resetPasswordUnsecured = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    user.password = password; // pre('save') hook will hash this
    await user.save();

    res.status(200).json({ msg: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
