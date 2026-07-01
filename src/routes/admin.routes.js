import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueChart,
} from '../controllers/admin.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// সব admin routes protected
router.use(verifyToken, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);

export default router;