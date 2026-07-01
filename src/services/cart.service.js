import cartRepository from '../repositories/cart.repository.js';
import productRepository from '../repositories/product.repository.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Get Cart
// ─────────────────────────────────────────
const getCart = async (userId) => {
  const cart = await cartRepository.findOrCreate(userId);
  return cart;
};

// ─────────────────────────────────────────
// Add to Cart
// ─────────────────────────────────────────
const addToCart = async (userId, { productId, quantity, size, color }) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (!product.isActive) throw new AppError('Product is not available', 400);
  if (product.stock < quantity) {
    throw new AppError(`Only ${product.stock} items available in stock`, 400);
  }

  const cart = await cartRepository.findOrCreate(userId);

  const existingIndex = cart.items.findIndex(
    (item) => {
      // ✅ toString() দিয়ে compare করো
      const itemProductId = item.product._id
        ? item.product._id.toString()
        : item.product.toString();

      return (
        itemProductId === productId.toString() &&
        item.size === size &&
        item.color === color
      );
    }
  );

  if (existingIndex > -1) {
    const newQuantity = cart.items[existingIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      throw new AppError(`Only ${product.stock} items available in stock`, 400);
    }
    cart.items[existingIndex].quantity = newQuantity;
  } else {
    const price = product.discountPrice > 0
      ? product.discountPrice
      : product.price;

    cart.items.push({
      product: productId,
      quantity,
      size: size || null,
      color: color || null,
      price,
    });
  }

  await cartRepository.save(cart);
  return await cartRepository.findByUser(userId);
};

// ─────────────────────────────────────────
// Update Cart Item
// ─────────────────────────────────────────
const updateCartItem = async (userId, { productId, quantity, size, color }) => {
  const cart = await cartRepository.findOrCreate(userId);

  const itemIndex = cart.items.findIndex((item) => {
    const itemProductId = item.product._id
      ? item.product._id.toString()
      : item.product.toString();

    // ✅ null/undefined দুইটাকে same treat করো
    const itemColor = item.color || null;
    const reqColor = color || null;

    return (
      itemProductId === productId.toString() &&
      item.size === size &&
      itemColor === reqColor
    );
  });

  if (itemIndex === -1) throw new AppError('Item not found in cart', 404);

  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock < quantity) {
    throw new AppError(`Only ${product.stock} items available in stock`, 400);
  }

  cart.items[itemIndex].quantity = quantity;
  await cartRepository.save(cart);
  return await cartRepository.findByUser(userId);
};

// ─────────────────────────────────────────
// Remove from Cart
// ─────────────────────────────────────────
const removeFromCart = async (userId, { productId, size, color }) => {
  const cart = await cartRepository.findOrCreate(userId);

  const itemIndex = cart.items.findIndex((item) => {
    const itemProductId = item.product._id
      ? item.product._id.toString()
      : item.product.toString();

    // ✅ null/undefined দুইটাকে same treat করো
    const itemColor = item.color || null;
    const reqColor = color || null;

    return (
      itemProductId === productId.toString() &&
      item.size === size &&
      itemColor === reqColor
    );
  });

  if (itemIndex === -1) throw new AppError('Item not found in cart', 404);

  cart.items.splice(itemIndex, 1);
  await cartRepository.save(cart);
  return await cartRepository.findByUser(userId);
};

// ─────────────────────────────────────────
// Clear Cart
// ─────────────────────────────────────────
const clearCart = async (userId) => {
  await cartRepository.clearCart(userId);
  return { message: 'Cart cleared successfully' };
};

// ─────────────────────────────────────────
// Get Cart Summary
// ─────────────────────────────────────────
const getCartSummary = async (userId) => {
  const cart = await cartRepository.findByUser(userId);
  if (!cart || cart.items.length === 0) {
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
      deliveryCharge: 0,
      grandTotal: 0,
    };
  }

  const totalAmount = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Delivery charge logic
  const deliveryCharge = totalAmount >= 1000 ? 0 : 60;

  return {
    items: cart.items,
    totalItems,
    totalAmount,
    deliveryCharge,
    grandTotal: totalAmount + deliveryCharge,
  };
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
};

export default cartService;