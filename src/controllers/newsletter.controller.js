import newsletterService from '../services/newsletter.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Subscribe (Public)
// ─────────────────────────────────────────
export const subscribe = catchAsync(async (req, res) => {
  const { email, source } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  // Email validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address',
    });
  }

  const result = await newsletterService.subscribe(email, source);

  res.status(201).json({
    success: true,
    message: result.message,
    data: { subscriber: result.subscriber },
  });
});

// ─────────────────────────────────────────
// Unsubscribe (Public)
// ─────────────────────────────────────────
export const unsubscribe = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const result = await newsletterService.unsubscribe(email);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// ─────────────────────────────────────────
// Get All Subscribers (Admin)
// ─────────────────────────────────────────
export const getAllSubscribers = catchAsync(async (req, res) => {
  const result = await newsletterService.getAllSubscribers(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Delete Subscriber (Admin)
// ─────────────────────────────────────────
export const deleteSubscriber = catchAsync(async (req, res) => {
  const result = await newsletterService.deleteSubscriber(req.params.id);

  res.status(200).json({
    success: true,
    ...result,
  });
});