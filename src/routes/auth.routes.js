import { Router } from 'express';
import {
  register,
  verifyOTP,
  sendOTP,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
} from '../controllers/auth.controller.js';
import validate from '../middleware/validate.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validations/auth.validation.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/send-otp', otpLimiter, validate(sendOTPSchema), sendOTP);
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.use(verifyToken);
router.get('/me', getMe);
router.post('/logout', logout);
router.put('/change-password', validate(changePasswordSchema), changePassword);

export default router;