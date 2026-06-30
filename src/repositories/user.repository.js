import User from '../models/User.model.js';

const userRepository = {
  findByEmail: async (email) => {
    return await User.findOne({ email }).select('+password +refreshToken');
  },

  findByPhone: async (phone) => {
    return await User.findOne({ phone }).select('+password +refreshToken');
  },

  findByEmailOrPhone: async (contact) => {
    return await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    }).select('+password +refreshToken');
  },

  findById: async (id) => {
    return await User.findById(id);
  },

  findByIdWithPassword: async (id) => {
    return await User.findById(id).select('+password');
  },

  create: async (data) => {
    return await User.create(data);
  },

  updateById: async (id, data) => {
    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  updateRefreshToken: async (id, refreshToken) => {
    return await User.findByIdAndUpdate(id, { refreshToken });
  },

  findAll: async (filter = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { users, total };
  },

  blockUser: async (id, isBlocked) => {
    return await User.findByIdAndUpdate(id, { isBlocked }, { new: true });
  },

  addToWishlist: async (userId, productId) => {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );
  },

  removeFromWishlist: async (userId, productId) => {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );
  },
};

export default userRepository;