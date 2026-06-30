import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  size: { type: String, trim: true },
  color: { type: String, trim: true },
  price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────
// Virtual — total amount
// ─────────────────────────────────────────
cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

// ─────────────────────────────────────────
// Virtual — total items
// ─────────────────────────────────────────
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.index({ user: 1 });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;