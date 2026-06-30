import { Router } from 'express';
import {
  getAllCategories,
  getCategoryTree,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validations/category.validation.js';

const router = Router();

// ─────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────
router.get('/', getAllCategories);
router.get('/tree', getCategoryTree);
router.get('/:slug', getCategoryBySlug);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.use(verifyToken, isAdmin);
router.post(
  '/',
  upload.single('image'),
  validate(createCategorySchema),
  createCategory
);
router.put(
  '/:id',
  upload.single('image'),
  validate(updateCategorySchema),
  updateCategory
);
router.delete('/:id', deleteCategory);

export default router;