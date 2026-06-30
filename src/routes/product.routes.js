import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  getFeaturedProducts,
  getNewArrivals,
  getFlashSaleProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from '../controllers/product.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
} from '../validations/product.validation.js';

const router = Router();

// ─────────────────────────────────────────
// Public Routes
// ─────────────────────────────────────────
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/:slug', getProductBySlug);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.use(verifyToken, isAdmin);
router.post(
  '/',
  upload.array('images', 5),
  validate(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  upload.array('images', 5),
  validate(updateProductSchema),
  updateProduct
);
router.delete('/:id', deleteProduct);
router.delete('/:id/images', deleteProductImage);

export default router;