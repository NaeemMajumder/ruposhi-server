import productService from '../services/product.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get All Products
// ─────────────────────────────────────────
export const getAllProducts = catchAsync(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Get Product by Slug
// ─────────────────────────────────────────
export const getProductBySlug = catchAsync(async (req, res) => {
  const result = await productService.getProductBySlug(req.params.slug);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// ─────────────────────────────────────────
// Get Featured Products
// ─────────────────────────────────────────
export const getFeaturedProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const products = await productService.getFeaturedProducts(limit);
  res.status(200).json({
    success: true,
    data: { products },
  });
});

// ─────────────────────────────────────────
// Get New Arrivals
// ─────────────────────────────────────────
export const getNewArrivals = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const products = await productService.getNewArrivals(limit);
  res.status(200).json({
    success: true,
    data: { products },
  });
});

// ─────────────────────────────────────────
// Get Flash Sale Products
// ─────────────────────────────────────────
export const getFlashSaleProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const products = await productService.getFlashSaleProducts(limit);
  res.status(200).json({
    success: true,
    data: { products },
  });
});

// ─────────────────────────────────────────
// Create Product (Admin)
// ─────────────────────────────────────────
export const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(
    req.body,
    req.files
  );
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
});

// ─────────────────────────────────────────
// Update Product (Admin)
// ─────────────────────────────────────────
export const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.files
  );
  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
});

// ─────────────────────────────────────────
// Delete Product (Admin)
// ─────────────────────────────────────────
export const deleteProduct = catchAsync(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Delete Product Image (Admin)
// ─────────────────────────────────────────
export const deleteProductImage = catchAsync(async (req, res) => {
  const product = await productService.deleteProductImage(
    req.params.id,
    req.body.publicId
  );
  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
    data: { product },
  });
});