import Review from '../models/Review.model.js';

const reviewRepository = {
  findByProduct: async (productId, options = {}) => {
    const { page = 1, limit = 10, isApproved = true } = options;
    const skip = (page - 1) * limit;
    const filter = { product: productId };
    if (isApproved !== null) filter.isApproved = isApproved;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return { reviews, total };
  },

  findByUser: async (userId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .populate('product', 'name slug images')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ user: userId }),
    ]);

    return { reviews, total };
  },

  findByUserAndProduct: async (userId, productId) => {
    return await Review.findOne({ user: userId, product: productId });
  },

  findById: async (id) => {
    return await Review.findById(id)
      .populate('user', 'name avatar')
      .populate('product', 'name slug');
  },

  findAll: async (filter = {}, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .populate('product', 'name slug')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return { reviews, total };
  },

  create: async (data) => {
    return await Review.create(data);
  },

  updateById: async (id, data) => {
    return await Review.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('user', 'name avatar');
  },

  deleteById: async (id) => {
    const review = await Review.findById(id);
    if (review) await review.deleteOne();
    return review;
  },

  approveById: async (id) => {
    return await Review.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'name avatar');
  },

  getRatingStats: async (productId) => {
    return await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);
  },
};

export default reviewRepository;