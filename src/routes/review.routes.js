import { Router } from 'express';
import {
  getProductReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  getAllReviews,
} from '../controllers/review.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createReviewSchema,
  updateReviewSchema,
} from '../validations/review.validation.js';

const router = Router();

// ─────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────
router.get('/product/:productId', getProductReviews);

// ─────────────────────────────────────────
// Protected Routes (User)
// ─────────────────────────────────────────
router.use(verifyToken);

router.get('/my', getMyReviews);
router.post('/', validate(createReviewSchema), createReview);
router.put('/:id', validate(updateReviewSchema), updateReview);
router.delete('/:id', deleteReview);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.get('/', isAdmin, getAllReviews);
router.put('/:id/approve', isAdmin, approveReview);

export default router;