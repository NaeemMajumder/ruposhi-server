import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// 404 Not Found Handler
// ─────────────────────────────────────────
export const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

// ─────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join(', '), 400);
  }

  // JWT Invalid
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  // JWT Expired
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};