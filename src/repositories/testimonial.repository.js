import Testimonial from '../models/Testimonial.model.js';

const testimonialRepository = {
  findAll: async (filter = {}) => {
    return await Testimonial.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  },

  findActive: async (limit = 6) => {
    return await Testimonial.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .limit(limit);
  },

  findById: async (id) => {
    return await Testimonial.findById(id);
  },

  create: async (data) => {
    return await Testimonial.create(data);
  },

  updateById: async (id, data) => {
    return await Testimonial.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  deleteById: async (id) => {
    return await Testimonial.findByIdAndDelete(id);
  },

  toggleActive: async (id, isActive) => {
    return await Testimonial.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
  },
};

export default testimonialRepository;