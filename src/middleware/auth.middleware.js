import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Verify Token
// ─────────────────────────────────────────
export const verifyToken = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  const user = await User.findById(decoded.id).select('+password');

  if (!user) {
    return next(new AppError('User no longer exists', 401));
  }

  if (user.isBlocked) {
    return next(new AppError('Your account has been blocked', 403));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password recently changed. Please login again', 401));
  }

  req.user = user;
  next();
});

// ─────────────────────────────────────────
// Is Admin
// ─────────────────────────────────────────
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admins only', 403));
  }
  next();
};

// ─────────────────────────────────────────
// Optional Auth (cart, wishlist)
// ─────────────────────────────────────────
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked) {
      req.user = user;
    }
  } catch {
    // Invalid token — continue as guest
  }

  next();
});