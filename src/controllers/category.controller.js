import categoryService from '../services/category.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get All Categories
// ─────────────────────────────────────────
export const getAllCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getAllCategories(req.query);
  res.status(200).json({
    success: true,
    data: { categories },
  });
});

// ─────────────────────────────────────────
// Get Category Tree (Parent + Children)
// ─────────────────────────────────────────
export const getCategoryTree = catchAsync(async (req, res) => {
  const tree = await categoryService.getCategoryTree();
  res.status(200).json({
    success: true,
    data: { categories: tree },
  });
});

// ─────────────────────────────────────────
// Get Category by Slug
// ─────────────────────────────────────────
export const getCategoryBySlug = catchAsync(async (req, res) => {
  const result = await categoryService.getCategoryBySlug(req.params.slug);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// ─────────────────────────────────────────
// Create Category (Admin)
// ─────────────────────────────────────────
export const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category },
  });
});

// ─────────────────────────────────────────
// Update Category (Admin)
// ─────────────────────────────────────────
export const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
    req.file
  );
  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

// ─────────────────────────────────────────
// Delete Category (Admin)
// ─────────────────────────────────────────
export const deleteCategory = catchAsync(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  res.status(200).json({
    success: true,
    ...result,
  });
});