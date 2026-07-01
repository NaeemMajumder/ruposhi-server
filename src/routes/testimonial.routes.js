import { Router } from 'express';
import {
  getActiveTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonial,
} from '../controllers/testimonial.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// ─────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────
router.get('/', getActiveTestimonials);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.use(verifyToken, isAdmin);

router.get('/all', getAllTestimonials);
router.post('/', upload.single('avatar'), createTestimonial);
router.put('/:id', upload.single('avatar'), updateTestimonial);
router.delete('/:id', deleteTestimonial);
router.put('/:id/toggle', toggleTestimonial);

export default router;