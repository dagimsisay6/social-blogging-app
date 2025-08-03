import express from "express";
import {
  signup,
  login,
  verifyEmail,
  resetPasswordUnsecured,
  getProfile,
} from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", protect, getProfile);

router.post("/verify-email", verifyEmail);
router.post("/reset-password-unsecured", resetPasswordUnsecured);

export default router;
