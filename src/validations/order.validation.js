import Joi from 'joi';

export const placeOrderSchema = Joi.object({
  deliveryAddress: Joi.object({
    fullName: Joi.string().required().messages({
      'any.required': 'Full name is required',
    }),
    phone: Joi.string()
      .pattern(/^(\+8801|01)[3-9]\d{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please enter a valid BD phone number',
        'any.required': 'Phone is required',
      }),
    address: Joi.string().required().messages({
      'any.required': 'Address is required',
    }),
    city: Joi.string().required().messages({
      'any.required': 'City is required',
    }),
    district: Joi.string().required().messages({
      'any.required': 'District is required',
    }),
    postalCode: Joi.string().optional(),
  }).required(),
  paymentMethod: Joi.string().valid('cod', 'bkash').required().messages({
    'any.only': 'Payment method must be cod or bkash',
    'any.required': 'Payment method is required',
  }),
  couponCode: Joi.string().optional().allow(''),
  note: Joi.string().max(500).optional().allow(''),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    )
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Status is required',
    }),
  message: Joi.string().optional(),
});