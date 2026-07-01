import userRepository from '../repositories/user.repository.js';
import productRepository from '../repositories/product.repository.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Get My Profile
// ─────────────────────────────────────────
const getMyProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// ─────────────────────────────────────────
// Update My Profile
// ─────────────────────────────────────────
const updateMyProfile = async (userId, data) => {
  // Sensitive fields update করতে দেবো না
  const allowedFields = ['name', 'avatar'];
  const filteredData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) filteredData[field] = data[field];
  });

  const user = await userRepository.updateById(userId, filteredData);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// ─────────────────────────────────────────
// Get Wishlist
// ─────────────────────────────────────────
const getWishlist = async (userId) => {
  const user = await userRepository.getWishlist(userId);
  if (!user) throw new AppError('User not found', 404);
  return user.wishlist;
};

// ─────────────────────────────────────────
// Add to Wishlist
// ─────────────────────────────────────────
const addToWishlist = async (userId, productId) => {
  const product = await productRepository.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const user = await userRepository.addToWishlist(userId, productId);
  return user.wishlist;
};

// ─────────────────────────────────────────
// Remove from Wishlist
// ─────────────────────────────────────────
const removeFromWishlist = async (userId, productId) => {
  const user = await userRepository.removeFromWishlist(userId, productId);
  return user.wishlist;
};

// ─────────────────────────────────────────
// Add Address
// ─────────────────────────────────────────
const addAddress = async (userId, addressData) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // Max 5 addresses
  if (user.addresses.length >= 5) {
    throw new AppError('Maximum 5 addresses allowed', 400);
  }

  // First address automatically default
  if (user.addresses.length === 0) {
    addressData.isDefault = true;
  }

  return await userRepository.addAddress(userId, addressData);
};

// ─────────────────────────────────────────
// Update Address
// ─────────────────────────────────────────
const updateAddress = async (userId, addressId, data) => {
  const user = await userRepository.updateAddress(userId, addressId, data);
  if (!user) throw new AppError('Address not found', 404);
  return user;
};

// ─────────────────────────────────────────
// Delete Address
// ─────────────────────────────────────────
const deleteAddress = async (userId, addressId) => {
  const user = await userRepository.deleteAddress(userId, addressId);
  if (!user) throw new AppError('Address not found', 404);
  return user;
};

// ─────────────────────────────────────────
// Set Default Address
// ─────────────────────────────────────────
const setDefaultAddress = async (userId, addressId) => {
  const user = await userRepository.setDefaultAddress(userId, addressId);
  if (!user) throw new AppError('Address not found', 404);
  return user;
};

// ─────────────────────────────────────────
// Admin — Get All Users
// ─────────────────────────────────────────
const getAllUsers = async (queryString) => {
  const filter = {};
  if (queryString.role) filter.role = queryString.role;
  if (queryString.isBlocked) filter.isBlocked = queryString.isBlocked === 'true';
  if (queryString.search) {
    filter.$or = [
      { name: { $regex: queryString.search, $options: 'i' } },
      { email: { $regex: queryString.search, $options: 'i' } },
      { phone: { $regex: queryString.search, $options: 'i' } },
    ];
  }

  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const { users, total } = await userRepository.findAll(filter, {
    page,
    limit,
  });

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────
// Admin — Get User by ID
// ─────────────────────────────────────────
const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// ─────────────────────────────────────────
// Admin — Block/Unblock User
// ─────────────────────────────────────────
const toggleBlockUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new AppError('User not found', 404);

  if (user.role === 'admin') {
    throw new AppError('Cannot block an admin user', 400);
  }

  const updatedUser = await userRepository.blockUser(id, !user.isBlocked);
  return {
    user: updatedUser,
    message: updatedUser.isBlocked
      ? 'User blocked successfully'
      : 'User unblocked successfully',
  };
};

const userService = {
  getMyProfile,
  updateMyProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  getUserById,
  toggleBlockUser,
};

export default userService;