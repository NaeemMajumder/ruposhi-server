import Newsletter from '../models/Newsletter.model.js';

const newsletterRepository = {
  findByEmail: async (email) => {
    return await Newsletter.findOne({ email: email.toLowerCase() });
  },

  findAll: async (filter = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-subscribedAt' } = options;
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      Newsletter.find(filter).sort(sort).skip(skip).limit(limit),
      Newsletter.countDocuments(filter),
    ]);

    return { subscribers, total };
  },

  findActive: async () => {
    return await Newsletter.find({ isActive: true });
  },

  create: async (data) => {
    return await Newsletter.create(data);
  },

  updateById: async (id, data) => {
    return await Newsletter.findByIdAndUpdate(id, data, { new: true });
  },

  unsubscribe: async (email) => {
    return await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        isActive: false,
        unsubscribedAt: new Date(),
      },
      { new: true }
    );
  },

  deleteById: async (id) => {
    return await Newsletter.findByIdAndDelete(id);
  },

  countActive: async () => {
    return await Newsletter.countDocuments({ isActive: true });
  },
};

export default newsletterRepository;