import reviewService from '../services/review.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get Product Reviews
// ─────────────────────────────────────────
export const getProductReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getProductReviews(
    req.params.productId,
    req.query
  );
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Get My Reviews
// ─────────────────────────────────────────
export const getMyReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getMyReviews(req.user._id, req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Create Review
// ─────────────────────────────────────────
export const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Review submitted successfully. Pending approval.',
    data: { review },
  });
});

// ─────────────────────────────────────────
// Update Review
// ─────────────────────────────────────────
export const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.user._id,
    req.body
  );
  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: { review },
  });
});

// ─────────────────────────────────────────
// Delete Review
// ─────────────────────────────────────────
export const deleteReview = catchAsync(async (req, res) => {
  const result = await reviewService.deleteReview(
    req.params.id,
    req.user._id,
    req.user.role === 'admin'
  );
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Approve Review (Admin)
// ─────────────────────────────────────────
export const approveReview = catchAsync(async (req, res) => {
  const review = await reviewService.approveReview(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Review approved successfully',
    data: { review },
  });
});

// ─────────────────────────────────────────
// Get All Reviews (Admin)
// ─────────────────────────────────────────
export const getAllReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getAllReviews(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});