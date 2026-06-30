import AppError from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError('Request body is empty', 400));
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return next(new AppError(messages, 400));
  }

  req.body = value;
  next();
};

export default validate;