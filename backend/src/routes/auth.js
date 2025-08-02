<<<<<<< HEAD
import express from 'express';
import bcrypt from 'bcrypt'; // Changed from 'bcryptjs' to 'bcrypt'
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Note the .js extension

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        firstName: user.firstName
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
=======
import express from "express";
import multer from "multer";
import path from "path";
import {
  signup,
  login,
  verifyEmail,
  resetPasswordUnsecured,
  getProfile,
} from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/verify-email", verifyEmail);
router.post("/reset-password-unsecured", resetPasswordUnsecured);

router.put(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({
        msg: "Profile picture updated successfully",
        profilePicture: user.profilePicture,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ msg: "Server error updating profile picture" });
    }
  }
);

export default router;
>>>>>>> 6b21d28866111b7f1f3c29afa41483d44ae39efb
