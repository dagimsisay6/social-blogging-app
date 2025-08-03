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
