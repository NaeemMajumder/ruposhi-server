import productRepository from "../repositories/product.repository.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/upload.middleware.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/apiFeatures.js";
import Product from "../models/Product.model.js";

// ─────────────────────────────────────────
// Get All Products (filter + sort + paginate)
// ─────────────────────────────────────────
const getAllProducts = async (queryString) => {
  const filter = { isActive: true };

  // Category filter
  if (queryString.category) filter.category = queryString.category;

  // Size filter
  if (queryString.size) filter.sizes = { $in: [queryString.size] };

  // Color filter
  if (queryString.color) {
    filter["colors.name"] = { $regex: queryString.color, $options: "i" };
  }

  // Price range filter
  if (queryString.minPrice || queryString.maxPrice) {
    filter.price = {};
    if (queryString.minPrice) filter.price.$gte = Number(queryString.minPrice);
    if (queryString.maxPrice) filter.price.$lte = Number(queryString.maxPrice);
  }

  // Search filter
  if (queryString.search) {
    filter.$or = [
      { name: { $regex: queryString.search, $options: "i" } },
      { tags: { $in: [new RegExp(queryString.search, "i")] } },
    ];
  }

  // Sort
  let sort = "-createdAt";
  if (queryString.sort) {
    const sortMap = {
      "price-asc": "price",
      "price-desc": "-price",
      newest: "-createdAt",
      popular: "-totalSold",
      rating: "-ratings.average",
    };
    sort = sortMap[queryString.sort] || "-createdAt";
  }

  // Pagination
  const page = parseInt(queryString.page, 10) || 1;
  const limit = parseInt(queryString.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const { products, total } = await productRepository.findAll(filter, {
    sort,
    skip,
    limit,
  });

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

// ─────────────────────────────────────────
// Get Product by Slug
// ─────────────────────────────────────────
const getProductBySlug = async (slug) => {
  const product = await productRepository.findBySlug(slug);
  if (!product) throw new AppError("Product not found", 404);

  const related = await productRepository.findRelated(
    product.category._id,
    product._id,
  );

  return { product, related };
};

// ─────────────────────────────────────────
// Get Featured Products
// ─────────────────────────────────────────
const getFeaturedProducts = async (limit) => {
  return await productRepository.findFeatured(limit);
};

// ─────────────────────────────────────────
// Get New Arrivals
// ─────────────────────────────────────────
const getNewArrivals = async (limit) => {
  return await productRepository.findNewArrivals(limit);
};

// ─────────────────────────────────────────
// Get Flash Sale Products
// ─────────────────────────────────────────
const getFlashSaleProducts = async (limit) => {
  return await productRepository.findFlashSale(limit);
};

// ─────────────────────────────────────────
// Create Product (Admin)
// ─────────────────────────────────────────
const createProduct = async (data, files) => {
  // Upload images to Cloudinary
  const images = [];
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const result = await uploadToCloudinary(files[i].buffer, "products", {
        width: 800,
        height: 800,
        crop: "fill",
      });
      images.push({
        ...result,
        isDefault: i === 0,
      });
    }
  }

  const product = await productRepository.create({ ...data, images });
  return product;
};

//Temporary — Cloudinary setup না হওয়া পর্যন্ত
// const createProduct = async (data, files) => {
//   // ─────────────────────────────────────────
//   // Image Upload — Cloudinary ready হলে activate হবে
//   // ─────────────────────────────────────────
//   const images = [];
//   const cloudinaryReady =
//     process.env.CLOUDINARY_CLOUD_NAME &&
//     process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

//   if (files && files.length > 0 && cloudinaryReady) {
//     for (let i = 0; i < files.length; i++) {
//       const result = await uploadToCloudinary(
//         files[i].buffer,
//         'products',
//         { width: 800, height: 800, crop: 'fill' }
//       );
//       images.push({ ...result, isDefault: i === 0 });
//     }
//   }

//   const product = await productRepository.create({ ...data, images });
//   return product;
// };

// ─────────────────────────────────────────
// Update Product (Admin)
// ─────────────────────────────────────────
const updateProduct = async (id, data, files) => {
  const product = await productRepository.findById(id);
  if (!product) throw new AppError("Product not found", 404);

  // Upload new images if provided
  if (files && files.length > 0) {
    const newImages = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, "products");
      newImages.push(result);
    }
    data.images = [...product.images, ...newImages];
  }

  return await productRepository.updateById(id, data);
};

// ─────────────────────────────────────────
// Delete Product (Admin)
// ─────────────────────────────────────────
const deleteProduct = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) throw new AppError("Product not found", 404);

  // Delete images from Cloudinary
  for (const image of product.images) {
    if (image.public_id) {
      await deleteFromCloudinary(image.public_id);
    }
  }

  await productRepository.deleteById(id);
  return { message: "Product deleted successfully" };
};

// ─────────────────────────────────────────
// Delete Product Image (Admin)
// ─────────────────────────────────────────
const deleteProductImage = async (productId, publicId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  await deleteFromCloudinary(publicId);

  const updatedImages = product.images.filter(
    (img) => img.public_id !== publicId,
  );

  return await productRepository.updateById(productId, {
    images: updatedImages,
  });
};

// product.service.js এ add করো

const updateVideo = async (productId, videoData) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  return await productRepository.updateById(productId, {
    youtubeVideo: videoData,
  });
};

const removeVideo = async (productId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  return await productRepository.updateById(productId, {
    youtubeVideo: { url: null, videoId: null, title: null },
  });
};

const bulkAddVideo = async (productIds, videoData) => {
  return await productRepository.bulkAddVideo(productIds, videoData);
};

const productService = {
  getAllProducts,
  getProductBySlug,
  getFeaturedProducts,
  getNewArrivals,
  getFlashSaleProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  updateVideo,
  removeVideo,
  bulkAddVideo,
};

export default productService;
