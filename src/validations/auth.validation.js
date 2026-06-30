import Joi from 'joi';

const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().pattern(phoneRegex).required().messages({
    'string.pattern.base': 'Please enter a valid BD phone number',
    'any.required': 'Phone is required',
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base':
      'Password must contain uppercase, lowercase, number and special character',
    'any.required': 'Password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required',
  }),
});

export const loginSchema = Joi.object({
  emailOrPhone: Joi.string().required().messages({
    'any.required': 'Email or phone is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const sendOTPSchema = Joi.object({
  contact: Joi.string().required().messages({
    'any.required': 'Email or phone is required',
  }),
  purpose: Joi.string()
    .valid('register', 'login', 'reset-password', 'verify-email')
    .required()
    .messages({
      'any.only': 'Invalid purpose',
      'any.required': 'Purpose is required',
    }),
});

export const verifyOTPSchema = Joi.object({
  contact: Joi.string().required().messages({
    'any.required': 'Email or phone is required',
  }),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be 6 digits',
    'any.required': 'OTP is required',
  }),
  purpose: Joi.string()
    .valid('register', 'login', 'reset-password', 'verify-email')
    .required(),
});

export const forgotPasswordSchema = Joi.object({
  contact: Joi.string().required().messages({
    'any.required': 'Email or phone is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  contact: Joi.string().required(),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be 6 digits',
    'any.required': 'OTP is required',
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base':
      'Password must contain uppercase, lowercase, number and special character',
    'any.required': 'Password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required',
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base':
      'Password must contain uppercase, lowercase, number and special character',
    'any.required': 'New password is required',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required',
  }),
});