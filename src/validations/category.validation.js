import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Category name must be at least 2 characters',
    'string.max': 'Category name cannot exceed 50 characters',
    'any.required': 'Category name is required',
  }),
  description: Joi.string().max(200).optional(),
  parentCategory: Joi.string().hex().length(24).optional().allow(null),
  isActive: Joi.boolean()
    .truthy('true', '1', 'yes')
    .falsy('false', '0', 'no')
    .optional(),
  sortOrder: Joi.number().optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional(),
  parentCategory: Joi.string().hex().length(24).optional().allow(null),
  isActive: Joi.boolean()
    .truthy('true', '1', 'yes')
    .falsy('false', '0', 'no')
    .optional(),
  sortOrder: Joi.number().optional(),
});