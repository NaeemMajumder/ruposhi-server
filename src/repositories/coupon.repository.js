import Coupon from '../models/Coupon.model.js';

const couponRepository = {
  findByCode: async (code) => {
    return await Coupon.findOne({ code: code.toUpperCase() });
  },

  findById: async (id) => {
    return await Coupon.findById(id);
  },

  findAll: async (filter = {}) => {
    return await Coupon.find(filter).sort('-createdAt');
  },

  create: async (data) => {
    return await Coupon.create(data);
  },

  updateById: async (id, data) => {
    return await Coupon.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  deleteById: async (id) => {
    return await Coupon.findByIdAndDelete(id);
  },

  incrementUsage: async (id, userId) => {
    return await Coupon.findByIdAndUpdate(id, {
      $inc: { usedCount: 1 },
      $push: { usedBy: userId },
    });
  },
};

export default couponRepository;