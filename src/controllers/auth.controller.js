import authService from '../services/auth.service.js';
import catchAsync from '../utils/catchAsync.js';
import { sendTokenResponse } from '../utils/generateToken.js';

// ─────────────────────────────────────────
// Register
// ─────────────────────────────────────────
export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, ...result });
});

// ─────────────────────────────────────────
// Verify OTP (Registration)
// ─────────────────────────────────────────
export const verifyOTP = catchAsync(async (req, res) => {
  const { contact, otp } = req.body;
  const { user, accessToken, refreshToken } =
    await authService.verifyRegistration(contact, otp);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Account verified successfully',
    accessToken,
    data: { user },
  });
});

// ─────────────────────────────────────────
// Send OTP
// ─────────────────────────────────────────
export const sendOTP = catchAsync(async (req, res) => {
  const { contact, purpose } = req.body;
  const result = await authService.sendOTP(contact, purpose);
  res.status(200).json({ success: true, ...result });
});

// ─────────────────────────────────────────
// Login
// ─────────────────────────────────────────
export const login = catchAsync(async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const { user, accessToken, refreshToken } =
    await authService.login(emailOrPhone, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    accessToken,
    data: { user },
  });
});

// ─────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────
export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const result = await authService.refreshToken(token);
  res.status(200).json({ success: true, ...result });
});

// ─────────────────────────────────────────
// Logout
// ─────────────────────────────────────────
export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user._id);

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────
export const forgotPassword = catchAsync(async (req, res) => {
  const { contact } = req.body;
  const result = await authService.forgotPassword(contact);
  res.status(200).json({ success: true, ...result });
});

// ─────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────
export const resetPassword = catchAsync(async (req, res) => {
  const { contact, otp, password } = req.body;
  const result = await authService.resetPassword(contact, otp, password);
  res.status(200).json({ success: true, ...result });
});

// ─────────────────────────────────────────
// Change Password
// ─────────────────────────────────────────
export const changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.password
  );
  res.status(200).json({ success: true, ...result });
});

// ─────────────────────────────────────────
// Get Me
// ─────────────────────────────────────────
export const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});