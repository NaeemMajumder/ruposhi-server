import mongoose from 'mongoose';
import Product from './Product.model.js';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    isApproved: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ rating: 1 });

// ─────────────────────────────────────────
// Static — update product ratings
// ─────────────────────────────────────────
reviewSchema.statics.updateProductRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].average * 10) / 10,
      'ratings.count': stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
};

// Auto update ratings after save/delete
reviewSchema.post('save', function () {
  this.constructor.updateProductRatings(this.product);
});

reviewSchema.post('deleteOne', { document: true }, function () {
  this.constructor.updateProductRatings(this.product);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;