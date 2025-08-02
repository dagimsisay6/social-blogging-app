import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const user = new User({ firstName, lastName, email, password });
    await user.save();

    res.status(201).json({ msg: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
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
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
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
      return res.status(404).json({ msg: 'User not found with that email.' });
    }

    res.status(200).json({ msg: 'Email verified.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
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
      return res.status(404).json({ msg: 'User not found.' });
    }

    // CRITICAL FIX: We are no longer manually hashing the password here.
    // Instead, we just set the new password on the user object.
    // The pre('save') middleware in the User model will now handle the hashing automatically.
    user.password = password;

    // The user's password will be hashed by the 'pre('save')' hook here
    await user.save();

    res.status(200).json({ msg: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
