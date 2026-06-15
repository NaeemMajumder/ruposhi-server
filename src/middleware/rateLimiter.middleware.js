import rateLimit from 'express-rate-limit';

// ─────────────────────────────────────────
// Global Rate Limiter
// ─────────────────────────────────────────
export const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes',
  },
});

// ─────────────────────────────────────────
// Auth Rate Limiter (login, register)
// ─────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 900000, // 15 min
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again after 15 minutes',
  },
});

// ─────────────────────────────────────────
// OTP Rate Limiter
// ─────────────────────────────────────────
export const otpLimiter = rateLimit({
  windowMs: 300000, // 5 min
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX) || 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again after 5 minutes',
  },
});