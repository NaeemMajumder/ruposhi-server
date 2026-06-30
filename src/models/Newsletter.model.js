import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    source: {
      type: String,
      enum: ['homepage', 'footer', 'popup', 'checkout'],
      default: 'homepage',
    },
  },
  { timestamps: true }
);

newsletterSchema.index({ isActive: 1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;