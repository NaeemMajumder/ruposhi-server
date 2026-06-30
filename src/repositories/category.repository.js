import Category from '../models/Category.model.js';

const categoryRepository = {
  findAll: async (filter = {}) => {
    return await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 });
  },

  findById: async (id) => {
    return await Category.findById(id)
      .populate('parentCategory', 'name slug');
  },

  findBySlug: async (slug) => {
    return await Category.findOne({ slug, isActive: true })
      .populate('parentCategory', 'name slug');
  },

  findParents: async () => {
    return await Category.find({
      parentCategory: null,
      isActive: true,
    }).sort({ sortOrder: 1 });
  },

  findChildren: async (parentId) => {
    return await Category.find({
      parentCategory: parentId,
      isActive: true,
    }).sort({ sortOrder: 1 });
  },

  findWithChildren: async () => {
    const parents = await Category.find({
      parentCategory: null,
      isActive: true,
    }).sort({ sortOrder: 1 });

    const result = await Promise.all(
      parents.map(async (parent) => {
        const children = await Category.find({
          parentCategory: parent._id,
          isActive: true,
        }).sort({ sortOrder: 1 });

        return { ...parent.toObject(), children };
      })
    );

    return result;
  },

  create: async (data) => {
    const category = new Category(data);
    await category.save();
    return category;
  },

  updateById: async (id, data) => {
    return await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('parentCategory', 'name slug');
  },

  deleteById: async (id) => {
    return await Category.findByIdAndDelete(id);
  },

  hasChildren: async (id) => {
    const count = await Category.countDocuments({ parentCategory: id });
    return count > 0;
  },

  hasProducts: async (id) => {
    const { default: Product } = await import('../models/Product.model.js');
    const count = await Product.countDocuments({ category: id });
    return count > 0;
  },
};

export default categoryRepository;