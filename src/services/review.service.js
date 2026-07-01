import reviewRepository from '../repositories/review.repository.js';
import productRepository from '../repositories/product.repository.js';
import orderRepository from '../repositories/order.repository.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Get Product Reviews
// ─────────────────────────────────────────
const getProductReviews = async (productId, queryString) => {
  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const { reviews, total } = await reviewRepository.findByProduct(
    productId,
    { page, limit, isApproved: true }
  );

  // Rating stats
  const ratingStats = await reviewRepository.getRatingStats(productId);

  // Format rating breakdown
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingStats.forEach((stat) => {
    ratingBreakdown[stat._id] = stat.count;
  });

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    ratingBreakdown,
  };
};

// ─────────────────────────────────────────
// Get My Reviews
// ─────────────────────────────────────────
const getMyReviews = async (userId, queryString) => {
  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const { reviews, total } = await reviewRepository.findByUser(userId, {
    page,
    limit,
  });

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────
// Create Review
// ─────────────────────────────────────────
const createReview = async (userId, data) => {
  const { productId, rating, title, comment } = data;

  // Product exists?
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  // Already reviewed?
  const existing = await reviewRepository.findByUserAndProduct(
    userId,
    productId
  );
  if (existing) throw new AppError('You have already reviewed this product', 400);

  // Verified purchase check
  const { orders } = await orderRepository.findByUser(userId, { limit: 100 });
  const isVerifiedPurchase = orders.some(
    (order) =>
      order.status === 'delivered' &&
      order.items.some(
        (item) => item.product.toString() === productId.toString()
      )
  );

  const review = await reviewRepository.create({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
    isVerifiedPurchase,
    isApproved: false, // Admin approval দরকার
  });

  return review;
};

// ─────────────────────────────────────────
// Update Review
// ─────────────────────────────────────────
const updateReview = async (reviewId, userId, data) => {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  if (review.user._id.toString() !== userId.toString()) {
    throw new AppError('You can only edit your own reviews', 403);
  }

  // Update হলে re-approval দরকার
  data.isApproved = false;

  return await reviewRepository.updateById(reviewId, data);
};

// ─────────────────────────────────────────
// Delete Review
// ─────────────────────────────────────────
const deleteReview = async (reviewId, userId, isAdmin = false) => {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  if (!isAdmin && review.user._id.toString() !== userId.toString()) {
    throw new AppError('You can only delete your own reviews', 403);
  }

  await reviewRepository.deleteById(reviewId);
  return { message: 'Review deleted successfully' };
};

// ─────────────────────────────────────────
// Approve Review (Admin)
// ─────────────────────────────────────────
const approveReview = async (reviewId) => {
  const review = await reviewRepository.approveById(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  return review;
};

// ─────────────────────────────────────────
// Get All Reviews (Admin)
// ─────────────────────────────────────────
const getAllReviews = async (queryString) => {
  const filter = {};
  if (queryString.isApproved !== undefined) {
    filter.isApproved = queryString.isApproved === 'true';
  }
  if (queryString.productId) filter.product = queryString.productId;

  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const { reviews, total } = await reviewRepository.findAll(filter, {
    page,
    limit,
  });

  return {
    reviews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const reviewService = {
  getProductReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  getAllReviews,
};

export default reviewService;