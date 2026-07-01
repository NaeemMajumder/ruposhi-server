import couponRepository from '../repositories/coupon.repository.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Get All Coupons (Admin)
// ─────────────────────────────────────────
const getAllCoupons = async (queryString) => {
  const filter = {};
  if (queryString.isActive !== undefined) {
    filter.isActive = queryString.isActive === 'true';
  }
  return await couponRepository.findAll(filter);
};

// ─────────────────────────────────────────
// Get Coupon by ID (Admin)
// ─────────────────────────────────────────
const getCouponById = async (id) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  return coupon;
};

// ─────────────────────────────────────────
// Create Coupon (Admin)
// ─────────────────────────────────────────
const createCoupon = async (data) => {
  // Duplicate code check
  const existing = await couponRepository.findByCode(data.code);
  if (existing) throw new AppError('Coupon code already exists', 400);

  // Percentage validation
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    throw new AppError('Percentage discount cannot exceed 100%', 400);
  }

  return await couponRepository.create(data);
};

// ─────────────────────────────────────────
// Update Coupon (Admin)
// ─────────────────────────────────────────
const updateCoupon = async (id, data) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);

  if (data.discountType === 'percentage' && data.discountValue > 100) {
    throw new AppError('Percentage discount cannot exceed 100%', 400);
  }

  return await couponRepository.updateById(id, data);
};

// ─────────────────────────────────────────
// Delete Coupon (Admin)
// ─────────────────────────────────────────
const deleteCoupon = async (id) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);

  await couponRepository.deleteById(id);
  return { message: 'Coupon deleted successfully' };
};

// ─────────────────────────────────────────
// Toggle Active Status (Admin)
// ─────────────────────────────────────────
const toggleCouponStatus = async (id) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);

  const updated = await couponRepository.updateById(id, {
    isActive: !coupon.isActive,
  });

  return {
    coupon: updated,
    message: updated.isActive
      ? 'Coupon activated successfully'
      : 'Coupon deactivated successfully',
  };
};

// ─────────────────────────────────────────
// Validate Coupon (User)
// ─────────────────────────────────────────
const validateCoupon = async (code, userId, totalAmount) => {
  const coupon = await couponRepository.findByCode(code);

  if (!coupon) throw new AppError('Invalid coupon code', 400);
  if (!coupon.isActive) throw new AppError('Coupon is not active', 400);
  if (coupon.expiryDate < new Date()) throw new AppError('Coupon has expired', 400);
  if (coupon.startDate && coupon.startDate > new Date()) {
    throw new AppError('Coupon is not yet active', 400);
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new AppError('Coupon usage limit exceeded', 400);
  }
  if (coupon.usedBy.map(id => id.toString()).includes(userId.toString())) {
    throw new AppError('You have already used this coupon', 400);
  }
  if (totalAmount < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount ৳${coupon.minOrderAmount} required`,
      400
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (totalAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, totalAmount);
  }

  discountAmount = Math.round(discountAmount);

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    },
    discountAmount,
    finalAmount: totalAmount - discountAmount,
  };
};

const couponService = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
};

export default couponService;