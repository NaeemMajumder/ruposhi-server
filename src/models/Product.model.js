import mongoose from 'mongoose';
import slugify from 'slugify';

const flashSaleSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  discountPercent: { type: Number, min: 0, max: 100 },
  startTime: Date,
  endTime: Date,
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: 0,
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    sizes: [
      {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
      },
    ],
    colors: [
      {
        name: { type: String, required: true },
        hexCode: { type: String },
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    fabric: { type: String, trim: true },
    careInstructions: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    flashSale: flashSaleSchema,
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalSold: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, isNewArrival: 1 });
productSchema.index({ isActive: 1, 'flashSale.isActive': 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ tags: 1 });

// ─────────────────────────────────────────
// Virtual — effective price
// ─────────────────────────────────────────
productSchema.virtual('effectivePrice').get(function () {
  if (this.discountPrice && this.discountPrice > 0) {
    return this.discountPrice;
  }
  return this.price;
});

// ─────────────────────────────────────────
// Virtual — discount percentage
// ─────────────────────────────────────────
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.discountPrice > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// ─────────────────────────────────────────
// Auto generate slug
// ─────────────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;