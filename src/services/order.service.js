import orderRepository from '../repositories/order.repository.js';
import cartRepository from '../repositories/cart.repository.js';
import productRepository from '../repositories/product.repository.js';
import couponRepository from '../repositories/coupon.repository.js';
import AppError from '../utils/AppError.js';
import { sendOrderConfirmationEmail } from '../utils/sendEmail.js';

// ─────────────────────────────────────────
// Apply Coupon
// ─────────────────────────────────────────
const applyCoupon = async (code, userId, totalAmount) => {
  const coupon = await couponRepository.findByCode(code);

  if (!coupon) throw new AppError('Invalid coupon code', 400);
  if (!coupon.isActive) throw new AppError('Coupon is not active', 400);
  if (coupon.expiryDate < new Date()) throw new AppError('Coupon has expired', 400);
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new AppError('Coupon usage limit exceeded', 400);
  }
  if (coupon.usedBy.includes(userId)) {
    throw new AppError('You have already used this coupon', 400);
  }
  if (totalAmount < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount ৳${coupon.minOrderAmount} required for this coupon`,
      400
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (totalAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  return {
    coupon,
    discountAmount: Math.round(discountAmount),
  };
};

// ─────────────────────────────────────────
// Place Order
// ─────────────────────────────────────────
const placeOrder = async (userId, userEmail, { deliveryAddress, paymentMethod, couponCode, note }) => {
  // Cart check
  const cart = await cartRepository.findByUser(userId);
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Build order items + stock check
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await productRepository.findById(
      item.product._id || item.product
    );

    if (!product) throw new AppError(`Product not found`, 404);
    if (!product.isActive) throw new AppError(`${product.name} is no longer available`, 400);
    if (product.stock < item.quantity) {
      throw new AppError(
        `Only ${product.stock} units of ${product.name} available`,
        400
      );
    }

    const price = item.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    });
  }

  // Delivery charge
  const deliveryCharge = subtotal >= 1000 ? 0 : 60;

  // Coupon apply
  let discountAmount = 0;
  let couponData = null;

  if (couponCode) {
    const couponResult = await applyCoupon(couponCode, userId, subtotal);
    discountAmount = couponResult.discountAmount;
    couponData = {
      code: couponResult.coupon.code,
      discountAmount,
    };
  }

  const totalAmount = subtotal + deliveryCharge - discountAmount;

  // Order create
  const order = await orderRepository.create({
    user: userId,
    items: orderItems,
    subtotal,
    discountAmount,
    deliveryCharge,
    totalAmount,
    coupon: couponData,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
    deliveryAddress,
    note,
    timeline: [
      {
        status: 'pending',
        message: 'Order placed successfully',
        timestamp: new Date(),
      },
    ],
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  // Stock update
  for (const item of cart.items) {
    await productRepository.updateStock(
      item.product._id || item.product,
      item.quantity
    );
  }

  // Coupon usage update
  if (couponCode && couponData) {
    const coupon = await couponRepository.findByCode(couponCode);
    await couponRepository.incrementUsage(coupon._id, userId);
  }

  // Cart clear
  await cartRepository.clearCart(userId);

  // Email notification — development এ skip
  if (process.env.NODE_ENV === 'production') {
    await sendOrderConfirmationEmail(userEmail, order);
  } else {
    console.log(`\n📦 Order placed: #${order.orderNumber} — ৳${order.totalAmount}\n`);
  }

  return order;
};

// ─────────────────────────────────────────
// Get My Orders
// ─────────────────────────────────────────
const getMyOrders = async (userId, options) => {
  const { orders, total } = await orderRepository.findByUser(userId, options);
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────
// Get Order by ID
// ─────────────────────────────────────────
const getOrderById = async (orderId, userId, isAdmin = false) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  // User নিজের order দেখতে পারবে
  if (!isAdmin && order.user._id.toString() !== userId.toString()) {
    throw new AppError('Access denied', 403);
  }

  return order;
};

// ─────────────────────────────────────────
// Cancel Order
// ─────────────────────────────────────────
const cancelOrder = async (orderId, userId) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (order.user._id.toString() !== userId.toString()) {
    throw new AppError('Access denied', 403);
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  // Stock restore
  for (const item of order.items) {
    await productRepository.updateStock(item.product, -item.quantity);
  }

  return await orderRepository.updateStatus(
    orderId,
    'cancelled',
    'Order cancelled by customer'
  );
};

// ─────────────────────────────────────────
// Update Order Status (Admin)
// ─────────────────────────────────────────
const updateOrderStatus = async (orderId, status, message) => {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  return await orderRepository.updateStatus(orderId, status, message);
};

// ─────────────────────────────────────────
// Get All Orders (Admin)
// ─────────────────────────────────────────
const getAllOrders = async (queryString) => {
  const filter = {};
  if (queryString.status) filter.status = queryString.status;
  if (queryString.paymentMethod) filter.paymentMethod = queryString.paymentMethod;
  if (queryString.paymentStatus) filter.paymentStatus = queryString.paymentStatus;

  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const { orders, total } = await orderRepository.findAll(filter, {
    page,
    limit,
    sort: queryString.sort || '-createdAt',
  });

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────
// Apply Coupon Check (standalone)
// ─────────────────────────────────────────
const checkCoupon = async (code, userId, totalAmount) => {
  return await applyCoupon(code, userId, totalAmount);
};

const orderService = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  checkCoupon,
};

export default orderService;