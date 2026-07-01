import Cart from '../models/Cart.model.js';

const cartRepository = {
  findByUser: async (userId) => {
    return await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name slug images price discountPrice stock isActive sizes colors',
    });
  },

  create: async (userId) => {
    return await Cart.create({ user: userId, items: [] });
  },

  findOrCreate: async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name slug images price discountPrice stock isActive sizes colors',
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
  },

  save: async (cart) => {
    return await cart.save();
  },

  clearCart: async (userId) => {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );
  },

  deleteByUser: async (userId) => {
    return await Cart.findOneAndDelete({ user: userId });
  },
};

export default cartRepository;