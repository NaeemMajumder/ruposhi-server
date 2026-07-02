import Product from "../models/Product.model.js";

const productRepository = {
  findAll: async (filter = {}, options = {}) => {
    const {
      sort = "-createdAt",
      skip = 0,
      limit = 12,
      populate = "category",
      select = "-__v",
    } = options;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate(populate, "name slug")
        .select(select)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return { products, total };
  },

  findBySlug: async (slug) => {
    return await Product.findOne({ slug, isActive: true }).populate(
      "category",
      "name slug",
    );
  },

  findById: async (id) => {
    return await Product.findById(id).populate("category", "name slug");
  },

  findFeatured: async (limit = 8) => {
    return await Product.find({ isActive: true, isFeatured: true })
      .populate("category", "name slug")
      .sort("-createdAt")
      .limit(limit);
  },

  findNewArrivals: async (limit = 8) => {
    return await Product.find({ isActive: true, isNewArrival: true })
      .populate("category", "name slug")
      .sort("-createdAt")
      .limit(limit);
  },

  findFlashSale: async (limit = 8) => {
    return await Product.find({
      isActive: true,
      "flashSale.isActive": true,
      "flashSale.endTime": { $gt: new Date() },
    })
      .populate("category", "name slug")
      .sort("-createdAt")
      .limit(limit);
  },

  findRelated: async (categoryId, productId, limit = 4) => {
    return await Product.find({
      category: categoryId,
      _id: { $ne: productId },
      isActive: true,
    })
      .populate("category", "name slug")
      .limit(limit);
  },

  create: async (data) => {
    // Product.create() এর বদলে new + save() use করো
    // এতে pre save hook guarantee trigger হবে
    const product = new Product(data);
    await product.save();
    return product;
  },

  updateById: async (id, data) => {
    return await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");
  },

  deleteById: async (id) => {
    return await Product.findByIdAndDelete(id);
  },

  updateStock: async (id, quantity) => {
    return await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -quantity, totalSold: quantity } },
      { new: true },
    );
  },

  countDocuments: async (filter = {}) => {
    return await Product.countDocuments(filter);
  },

  // product.repository.js এ add করো

  bulkAddVideo: async (productIds, videoData) => {
    return await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { youtubeVideo: videoData } },
    );
  },
};

export default productRepository;
