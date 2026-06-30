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
  const data = { ...req.body };

  // Array parse
  if (data.sizes && typeof data.sizes === 'string') {
    try { data.sizes = JSON.parse(data.sizes); }
    catch { data.sizes = [data.sizes]; }
  }
  if (data.colors && typeof data.colors === 'string') {
    try { data.colors = JSON.parse(data.colors); }
    catch { data.colors = [data.colors]; }
  }
  if (data.tags && typeof data.tags === 'string') {
    try { data.tags = JSON.parse(data.tags); }
    catch { data.tags = [data.tags]; }
  }

  // Number parse
  if (data.price) data.price = Number(data.price);
  if (data.discountPrice) data.discountPrice = Number(data.discountPrice);
  if (data.stock) data.stock = Number(data.stock);

  // ✅ Slug manually generate করো
  const hasBengali = /[\u0980-\u09FF]/.test(data.name || '');
  if (hasBengali) {
    const timestamp = Date.now().toString().slice(-6);
    data.slug = `product-${timestamp}`;
  } else {
    const { default: slugify } = await import('slugify');
    data.slug = slugify(data.name || '', { lower: true, strict: true });
  }

  const product = await productService.createProduct(data, req.files);

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