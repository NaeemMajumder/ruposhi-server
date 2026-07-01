import couponService from '../services/coupon.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get All Coupons (Admin)
// ─────────────────────────────────────────
export const getAllCoupons = catchAsync(async (req, res) => {
  const coupons = await couponService.getAllCoupons(req.query);
  res.status(200).json({
    success: true,
    data: { coupons },
  });
});

// ─────────────────────────────────────────
// Get Coupon by ID (Admin)
// ─────────────────────────────────────────
export const getCouponById = catchAsync(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);
  res.status(200).json({
    success: true,
    data: { coupon },
  });
});

// ─────────────────────────────────────────
// Create Coupon (Admin)
// ─────────────────────────────────────────
export const createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: { coupon },
  });
});

// ─────────────────────────────────────────
// Update Coupon (Admin)
// ─────────────────────────────────────────
export const updateCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: { coupon },
  });
});

// ─────────────────────────────────────────
// Delete Coupon (Admin)
// ─────────────────────────────────────────
export const deleteCoupon = catchAsync(async (req, res) => {
  const result = await couponService.deleteCoupon(req.params.id);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Toggle Coupon Status (Admin)
// ─────────────────────────────────────────
export const toggleCouponStatus = catchAsync(async (req, res) => {
  const result = await couponService.toggleCouponStatus(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
    data: { coupon: result.coupon },
  });
});

// ─────────────────────────────────────────
// Validate Coupon (User)
// ─────────────────────────────────────────
export const validateCoupon = catchAsync(async (req, res) => {
  const { code, totalAmount } = req.body;

  const result = await couponService.validateCoupon(
    code,
    req.user._id,
    Number(totalAmount)
  );

  res.status(200).json({
    success: true,
    message: 'Coupon is valid',
    data: result,
  });
});