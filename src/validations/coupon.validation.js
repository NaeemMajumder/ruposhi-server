import Joi from 'joi';

export const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).uppercase().required().messages({
    'string.min': 'Coupon code must be at least 3 characters',
    'string.max': 'Coupon code cannot exceed 20 characters',
    'any.required': 'Coupon code is required',
  }),
  description: Joi.string().max(200).optional(),
  discountType: Joi.string().valid('percentage', 'fixed').required().messages({
    'any.only': 'Discount type must be percentage or fixed',
    'any.required': 'Discount type is required',
  }),
  discountValue: Joi.number().min(1).required().messages({
    'number.min': 'Discount value must be at least 1',
    'any.required': 'Discount value is required',
  }),
  minOrderAmount: Joi.number().min(0).optional().default(0),
  maxDiscountAmount: Joi.number().min(0).optional().allow(null),
  maxUses: Joi.number().min(1).optional().allow(null),
  startDate: Joi.date().optional(),
  expiryDate: Joi.date().greater('now').required().messages({
    'date.greater': 'Expiry date must be in the future',
    'any.required': 'Expiry date is required',
  }),
  isActive: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .optional()
    .default(true),
});

export const updateCouponSchema = Joi.object({
  description: Joi.string().max(200).optional(),
  discountType: Joi.string().valid('percentage', 'fixed').optional(),
  discountValue: Joi.number().min(1).optional(),
  minOrderAmount: Joi.number().min(0).optional(),
  maxDiscountAmount: Joi.number().min(0).optional().allow(null),
  maxUses: Joi.number().min(1).optional().allow(null),
  startDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  isActive: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .optional(),
});

export const applyCouponSchema = Joi.object({
  code: Joi.string().required().messages({
    'any.required': 'Coupon code is required',
  }),
  totalAmount: Joi.number().min(0).required().messages({
    'any.required': 'Total amount is required',
  }),
});