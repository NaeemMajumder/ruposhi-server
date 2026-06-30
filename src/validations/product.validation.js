import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name cannot exceed 100 characters',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required',
  }),
  shortDescription: Joi.string().max(200).optional(),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required',
  }),
  discountPrice: Joi.number().min(0).optional(),
  category: Joi.string().hex().length(24).required().messages({
    'any.required': 'Category is required',
  }),
  sizes: Joi.array()
    .items(Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'))
    .optional(),
  colors: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        hexCode: Joi.string().optional(),
      })
    )
    .optional(),
  stock: Joi.number().min(0).required().messages({
    'number.min': 'Stock cannot be negative',
    'any.required': 'Stock is required',
  }),
  sku: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  fabric: Joi.string().optional(),
  careInstructions: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  flashSale: Joi.object({
    isActive: Joi.boolean().optional(),
    discountPercent: Joi.number().min(0).max(100).optional(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
  }).optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  shortDescription: Joi.string().max(200).optional(),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).optional(),
  category: Joi.string().hex().length(24).optional(),
  sizes: Joi.array()
    .items(Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'))
    .optional(),
  colors: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        hexCode: Joi.string().optional(),
      })
    )
    .optional(),
  stock: Joi.number().min(0).optional(),
  sku: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  fabric: Joi.string().optional(),
  careInstructions: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isNewArrival: Joi.boolean().optional(),
  flashSale: Joi.object({
    isActive: Joi.boolean().optional(),
    discountPercent: Joi.number().min(0).max(100).optional(),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
  }).optional(),
});