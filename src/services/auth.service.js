import bcrypt from "bcryptjs";
import crypto from "crypto";
import userRepository from "../repositories/user.repository.js";
import otpRepository from "../repositories/otp.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import { sendOTPSMS } from "../utils/sendSMS.js";
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";

// ─────────────────────────────────────────
// Generate OTP
// ─────────────────────────────────────────
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ─────────────────────────────────────────
// Send OTP (Email or SMS)
// ─────────────────────────────────────────
const sendOTP = async (contact, purpose) => {
  const otp = generateOTP();
  await otpRepository.create({ contact, otp, purpose });

  const isEmail = contact.includes('@');

  if (isEmail) {
    // ✅ Email OTP
    await sendOTPEmail(contact, otp, purpose);
  } else {
    // ✅ SMS OTP
    await sendOTPSMS(contact, otp);
  }

  return { message: `OTP sent to ${isEmail ? 'email' : 'phone'}` };
};

// ─────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────
const verifyOTP = async (contact, otp, purpose) => {
  const otpRecord = await otpRepository.findValid(contact, purpose);

  if (!otpRecord) {
    throw new AppError("OTP expired or invalid", 400);
  }

  if (otpRecord.attempts >= parseInt(process.env.OTP_MAX_ATTEMPTS || 3)) {
    throw new AppError("Maximum OTP attempts exceeded", 429);
  }

  if (otpRecord.otp !== otp) {
    await otpRepository.incrementAttempts(otpRecord._id);
    throw new AppError("Invalid OTP", 400);
  }

  await otpRepository.markAsUsed(otpRecord._id);
  return true;
};

// ─────────────────────────────────────────
// Register
// ─────────────────────────────────────────
const register = async (data) => {
  const { name, email, phone, password } = data;

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) throw new AppError("Email already registered", 400);

  const existingPhone = await userRepository.findByPhone(phone);
  if (existingPhone) throw new AppError("Phone already registered", 400);

  const user = await userRepository.create({
    name,
    email,
    phone,
    password,
  });

  // Send OTP for verification
  await sendOTP(email, "register");

  return {
    message: "Registration successful. Please verify your email.",
    userId: user._id,
  };
};

// ─────────────────────────────────────────
// Verify Registration OTP
// ─────────────────────────────────────────
const verifyRegistration = async (contact, otp) => {
  await verifyOTP(contact, otp, "register");

  const user = await userRepository.findByEmailOrPhone(contact);
  if (!user) throw new AppError("User not found", 404);

  await userRepository.updateById(user._id, { isVerified: true });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await userRepository.updateRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

// ─────────────────────────────────────────
// Login
// ─────────────────────────────────────────
const login = async (emailOrPhone, password) => {
  const user = await userRepository.findByEmailOrPhone(emailOrPhone);

  if (!user) throw new AppError("Invalid credentials", 401);
  if (!user.isVerified)
    throw new AppError("Please verify your account first", 401);
  if (user.isBlocked) throw new AppError("Your account has been blocked", 403);

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new AppError("Invalid credentials", 401);

  await userRepository.updateById(user._id, { lastLogin: new Date() });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await userRepository.updateRefreshToken(user._id, refreshToken);

  // ✅ এই lines add করো — password hide করো
  user.password = undefined;
  user.refreshToken = undefined;

  return { user, accessToken, refreshToken };
};

// ─────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────
const refreshToken = async (token) => {
  if (!token) throw new AppError("Refresh token not found", 401);

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await userRepository.findById(decoded.id);

  if (!user) throw new AppError("User not found", 401);
  if (user.isBlocked) throw new AppError("Your account has been blocked", 403);

  const accessToken = generateAccessToken(user._id);
  return { accessToken };
};

// ─────────────────────────────────────────
// Logout
// ─────────────────────────────────────────
const logout = async (userId) => {
  await userRepository.updateRefreshToken(userId, null);
  return { message: "Logged out successfully" };
};

// ─────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────
const forgotPassword = async (contact) => {
  const user = await userRepository.findByEmailOrPhone(contact);
  if (!user) throw new AppError("No account found with this email/phone", 404);

  await sendOTP(contact, "reset-password");

  return { message: "OTP sent for password reset" };
};

// ─────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────
const resetPassword = async (contact, otp, password) => {
  await verifyOTP(contact, otp, "reset-password");

  const user = await userRepository.findByEmailOrPhone(contact);
  if (!user) throw new AppError("User not found", 404);

  user.password = password;
  user.passwordChangedAt = new Date();
  await user.save();

  return { message: "Password reset successful" };
};

// ─────────────────────────────────────────
// Change Password
// ─────────────────────────────────────────
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) throw new AppError("User not found", 404);

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) throw new AppError("Current password is incorrect", 400);

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  return { message: "Password changed successfully" };
};

const authService = {
  register,
  verifyRegistration,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOTP,
  verifyOTP,
};

export default authService;
