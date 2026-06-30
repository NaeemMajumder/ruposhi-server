import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    designation: { type: String, trim: true },
    avatar: {
      public_id: String,
      url: String,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [300, 'Comment cannot exceed 300 characters'],
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ isActive: 1, sortOrder: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;