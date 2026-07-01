import { Router } from 'express';
import {
  initiatePayment,
  paymentCallback,
  verifyPayment,
  refundPayment,
} from '../controllers/payment.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ─────────────────────────────────────────
// bKash Callback — Public (bKash redirect করে)
// ─────────────────────────────────────────
router.get('/bkash/callback', paymentCallback);

// ─────────────────────────────────────────
// Protected Routes (User)
// ─────────────────────────────────────────
router.use(verifyToken);

router.post('/bkash/initiate', initiatePayment);
router.post('/bkash/verify', verifyPayment);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.post('/bkash/refund', isAdmin, refundPayment);

export default router;