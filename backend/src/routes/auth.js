import express from 'express';
import { signup, login, verifyEmail, resetPasswordUnsecured } from '../controllers/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
// The old secure routes and the previous insecure demo route are no longer in use
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);
// router.post('/reset-password-insecure-demo', resetPasswordDirectly);

// The new two-step insecure demo routes
router.post('/verify-email', verifyEmail);
router.post('/reset-password-unsecured', resetPasswordUnsecured);

export default router;
