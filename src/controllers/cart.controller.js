import cartService from '../services/cart.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get Cart
// ─────────────────────────────────────────
export const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  res.status(200).json({
    success: true,
    data: { cart },
  });
});

// ─────────────────────────────────────────
// Get Cart Summary
// ─────────────────────────────────────────
export const getCartSummary = catchAsync(async (req, res) => {
  const summary = await cartService.getCartSummary(req.user._id);
  res.status(200).json({
    success: true,
    data: { summary },
  });
});

// ─────────────────────────────────────────
// Add to Cart
// ─────────────────────────────────────────
export const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity = 1, size, color } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }

  const cart = await cartService.addToCart(req.user._id, {
    productId,
    quantity: parseInt(quantity),
    size,
    color,
  });

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: { cart },
  });
});

// ─────────────────────────────────────────
// Update Cart Item
// ─────────────────────────────────────────
export const updateCartItem = catchAsync(async (req, res) => {
  const { productId, quantity, size, color } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({
      success: false,
      message: 'Product ID and quantity are required',
    });
  }

  const cart = await cartService.updateCartItem(req.user._id, {
    productId,
    quantity: parseInt(quantity),
    size,
    color,
  });

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: { cart },
  });
});

// ─────────────────────────────────────────
// Remove from Cart
// ─────────────────────────────────────────
export const removeFromCart = catchAsync(async (req, res) => {
  const { productId, size, color } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }

  const cart = await cartService.removeFromCart(req.user._id, {
    productId,
    size,
    color,
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: { cart },
  });
});

// ─────────────────────────────────────────
// Clear Cart
// ─────────────────────────────────────────
export const clearCart = catchAsync(async (req, res) => {
  const result = await cartService.clearCart(req.user._id);
  res.status(200).json({
    success: true,
    ...result,
  });
});