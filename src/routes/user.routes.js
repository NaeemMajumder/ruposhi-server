import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  getUserById,
  toggleBlockUser,
} from '../controllers/user.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ─────────────────────────────────────────
// Protected Routes (User)
// ─────────────────────────────────────────
router.use(verifyToken);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Address
router.post('/address', addAddress);
router.put('/address/:addressId', updateAddress);
router.delete('/address/:addressId', deleteAddress);
router.put('/address/:addressId/default', setDefaultAddress);

// ─────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────
router.get('/', isAdmin, getAllUsers);
router.get('/:id', isAdmin, getUserById);
router.put('/:id/block', isAdmin, toggleBlockUser);

export default router;