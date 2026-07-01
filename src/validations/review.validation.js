import Joi from 'joi';

export const createReviewSchema = Joi.object({
  productId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Product ID is required',
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
  title: Joi.string().max(100).optional(),
  comment: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Comment must be at least 10 characters',
    'string.max': 'Comment cannot exceed 500 characters',
    'any.required': 'Comment is required',
  }),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  title: Joi.string().max(100).optional(),
  comment: Joi.string().min(10).max(500).optional(),
});