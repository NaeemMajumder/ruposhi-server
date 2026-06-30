import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },
    description: { type: String, trim: true },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: { type: Date, default: Date.now },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });

// ─────────────────────────────────────────
// Virtual — is expired
// ─────────────────────────────────────────
couponSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

// ─────────────────────────────────────────
// Virtual — is maxed out
// ─────────────────────────────────────────
couponSchema.virtual('isMaxedOut').get(function () {
  return this.maxUses !== null && this.usedCount >= this.maxUses;
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;