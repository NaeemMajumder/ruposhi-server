import userService from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get My Profile
// ─────────────────────────────────────────
export const getMyProfile = catchAsync(async (req, res) => {
  const user = await userService.getMyProfile(req.user._id);
  res.status(200).json({
    success: true,
    data: { user },
  });
});

// ─────────────────────────────────────────
// Update My Profile
// ─────────────────────────────────────────
export const updateMyProfile = catchAsync(async (req, res) => {
  const user = await userService.updateMyProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// ─────────────────────────────────────────
// Wishlist
// ─────────────────────────────────────────
export const getWishlist = catchAsync(async (req, res) => {
  const wishlist = await userService.getWishlist(req.user._id);
  res.status(200).json({
    success: true,
    data: { wishlist },
  });
});

export const addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }
  const wishlist = await userService.addToWishlist(req.user._id, productId);
  res.status(200).json({
    success: true,
    message: 'Added to wishlist',
    data: { wishlist },
  });
});

export const removeFromWishlist = catchAsync(async (req, res) => {
  const wishlist = await userService.removeFromWishlist(
    req.user._id,
    req.params.productId
  );
  res.status(200).json({
    success: true,
    message: 'Removed from wishlist',
    data: { wishlist },
  });
});

// ─────────────────────────────────────────
// Address
// ─────────────────────────────────────────
export const addAddress = catchAsync(async (req, res) => {
  const user = await userService.addAddress(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Address added successfully',
    data: { addresses: user.addresses },
  });
});

export const updateAddress = catchAsync(async (req, res) => {
  const user = await userService.updateAddress(
    req.user._id,
    req.params.addressId,
    req.body
  );
  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: { addresses: user.addresses },
  });
});

export const deleteAddress = catchAsync(async (req, res) => {
  const user = await userService.deleteAddress(
    req.user._id,
    req.params.addressId
  );
  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: { addresses: user.addresses },
  });
});

export const setDefaultAddress = catchAsync(async (req, res) => {
  const user = await userService.setDefaultAddress(
    req.user._id,
    req.params.addressId
  );
  res.status(200).json({
    success: true,
    message: 'Default address updated',
    data: { addresses: user.addresses },
  });
});

// ─────────────────────────────────────────
// Admin Controllers
// ─────────────────────────────────────────
export const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({
    success: true,
    data: { user },
  });
});

export const toggleBlockUser = catchAsync(async (req, res) => {
  const result = await userService.toggleBlockUser(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
    data: { user: result.user },
  });
});