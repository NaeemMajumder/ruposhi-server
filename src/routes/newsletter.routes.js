import { Router } from 'express';
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
} from '../controllers/newsletter.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ─────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.use(verifyToken, isAdmin);
router.get('/', getAllSubscribers);
router.delete('/:id', deleteSubscriber);

export default router;