import { Router } from 'express';
import {
  getCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// সব cart routes protected
router.use(verifyToken);

router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

export default router;