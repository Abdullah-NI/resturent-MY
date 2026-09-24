import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  validateRequest,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../validators/authValidator.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), registerUser);
router.post('/login', authLimiter, validateRequest(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', requireAuth, getCurrentUser);
router.put('/profile', requireAuth, updateProfile);
router.post('/forgot-password', otpLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', otpLimiter, validateRequest(verifyOtpSchema), verifyOtp);
router.post('/reset-password', otpLimiter, validateRequest(resetPasswordSchema), resetPassword);

export default router;
