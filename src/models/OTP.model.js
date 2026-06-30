import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: [true, 'Contact is required'],
    trim: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'reset-password', 'verify-email'],
    required: [true, 'Purpose is required'],
  },
  attempts: {
    type: Number,
    default: 0,
    max: [parseInt(process.env.OTP_MAX_ATTEMPTS) || 3, 'Max attempts exceeded'],
  },
  isUsed: { type: Boolean, default: false },
  expiresAt: {
    type: Date,
    required: true,
    default: () =>
      new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 5) * 60 * 1000),
  },
});

// ─────────────────────────────────────────
// TTL Index — auto delete after expiry
// ─────────────────────────────────────────
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ contact: 1, purpose: 1 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;