import orderService from '../services/order.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Place Order
// ─────────────────────────────────────────
export const placeOrder = catchAsync(async (req, res) => {
  const order = await orderService.placeOrder(
    req.user._id,
    req.user.email,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
});

// ─────────────────────────────────────────
// Get My Orders
// ─────────────────────────────────────────
export const getMyOrders = catchAsync(async (req, res) => {
  const result = await orderService.getMyOrders(req.user._id, req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Get Order by ID
// ─────────────────────────────────────────
export const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role === 'admin'
  );
  res.status(200).json({
    success: true,
    data: { order },
  });
});

// ─────────────────────────────────────────
// Cancel Order
// ─────────────────────────────────────────
export const cancelOrder = catchAsync(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

// ─────────────────────────────────────────
// Update Order Status (Admin)
// ─────────────────────────────────────────
export const updateOrderStatus = catchAsync(async (req, res) => {
  const { status, message } = req.body;
  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    message
  );
  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: { order },
  });
});

// ─────────────────────────────────────────
// Get All Orders (Admin)
// ─────────────────────────────────────────
export const getAllOrders = catchAsync(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Check Coupon
// ─────────────────────────────────────────
export const checkCoupon = catchAsync(async (req, res) => {
  const { code, totalAmount } = req.body;
  if (!code || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code and total amount are required',
    });
  }

  const result = await orderService.checkCoupon(
    code,
    req.user._id,
    Number(totalAmount)
  );

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      discountAmount: result.discountAmount,
      coupon: {
        code: result.coupon.code,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
      },
    },
  });
});