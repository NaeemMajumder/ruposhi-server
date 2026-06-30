import categoryRepository from '../repositories/category.repository.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.middleware.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Get All Categories (flat list)
// ─────────────────────────────────────────
const getAllCategories = async (query = {}) => {
  const filter = {};
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  return await categoryRepository.findAll(filter);
};

// ─────────────────────────────────────────
// Get Categories with Children (tree)
// ─────────────────────────────────────────
const getCategoryTree = async () => {
  return await categoryRepository.findWithChildren();
};

// ─────────────────────────────────────────
// Get Category by Slug
// ─────────────────────────────────────────
const getCategoryBySlug = async (slug) => {
  const category = await categoryRepository.findBySlug(slug);
  if (!category) throw new AppError('Category not found', 404);

  const children = await categoryRepository.findChildren(category._id);
  return { category, children };
};

// ─────────────────────────────────────────
// Get Category by ID
// ─────────────────────────────────────────
const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

// ─────────────────────────────────────────
// Create Category (Admin)
// ─────────────────────────────────────────
const createCategory = async (data, file) => {
  // Check duplicate name
  const existing = await categoryRepository.findAll({ name: data.name });
  if (existing.length > 0) throw new AppError('Category name already exists', 400);

  // Upload image if provided
  if (file) {
    const cloudinaryReady =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    if (cloudinaryReady) {
      const result = await uploadToCloudinary(file.buffer, 'categories');
      data.image = result;
    }
  }

  return await categoryRepository.create(data);
};

// ─────────────────────────────────────────
// Update Category (Admin)
// ─────────────────────────────────────────
const updateCategory = async (id, data, file) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  // Upload new image if provided
  if (file) {
    const cloudinaryReady =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    if (cloudinaryReady) {
      // Delete old image
      if (category.image?.public_id) {
        await deleteFromCloudinary(category.image.public_id);
      }
      const result = await uploadToCloudinary(file.buffer, 'categories');
      data.image = result;
    }
  }

  return await categoryRepository.updateById(id, data);
};

// ─────────────────────────────────────────
// Delete Category (Admin)
// ─────────────────────────────────────────
const deleteCategory = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw new AppError('Category not found', 404);

  // Check if has children
  const hasChildren = await categoryRepository.hasChildren(id);
  if (hasChildren) {
    throw new AppError(
      'Cannot delete category with subcategories. Delete subcategories first.',
      400
    );
  }

  // Check if has products
  const hasProducts = await categoryRepository.hasProducts(id);
  if (hasProducts) {
    throw new AppError(
      'Cannot delete category with products. Remove or reassign products first.',
      400
    );
  }

  // Delete image from Cloudinary
  if (category.image?.public_id) {
    await deleteFromCloudinary(category.image.public_id);
  }

  await categoryRepository.deleteById(id);
  return { message: 'Category deleted successfully' };
};

const categoryService = {
  getAllCategories,
  getCategoryTree,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;