import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  checkCoupon,
} from '../controllers/order.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  placeOrderSchema,
  updateOrderStatusSchema,
} from '../validations/order.validation.js';

const router = Router();

// ─────────────────────────────────────────
// Protected Routes (User)
// ─────────────────────────────────────────
router.use(verifyToken);

router.post('/', validate(placeOrderSchema), placeOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.post('/coupon/check', checkCoupon);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.get('/', isAdmin, getAllOrders);
router.put(
  '/:id/status',
  isAdmin,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;