import { Router } from 'express';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
} from '../controllers/coupon.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
} from '../validations/coupon.validation.js';

const router = Router();

// ─────────────────────────────────────────
// Protected User Route
// ─────────────────────────────────────────
router.post(
  '/validate',
  verifyToken,
  validate(applyCouponSchema),
  validateCoupon
);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.use(verifyToken, isAdmin);

router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.post('/', validate(createCouponSchema), createCoupon);
router.put('/:id', validate(updateCouponSchema), updateCoupon);
router.delete('/:id', deleteCoupon);
router.put('/:id/toggle', toggleCouponStatus);

export default router;