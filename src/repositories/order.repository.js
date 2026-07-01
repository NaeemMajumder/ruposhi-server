import Order from '../models/Order.model.js';

const orderRepository = {
  create: async (data) => {
    const order = new Order(data);
    await order.save();
    return order;
  },

  findById: async (id) => {
    return await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images');
  },

  findByUser: async (userId, options = {}) => {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;
    const filter = { user: userId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name slug images')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return { orders, total };
  },

  findAll: async (filter = {}, options = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name slug images')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return { orders, total };
  },

  updateStatus: async (id, status, message) => {
    const order = await Order.findById(id);
    if (!order) return null;

    order.status = status;
    order.timeline.push({
      status,
      message: message || `Order ${status}`,
      timestamp: new Date(),
    });

    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled') order.cancelledAt = new Date();

    await order.save();
    return order;
  },

  updatePaymentStatus: async (id, paymentData) => {
    return await Order.findByIdAndUpdate(
      id,
      {
        paymentStatus: 'paid',
        bkashPayment: paymentData,
      },
      { new: true }
    );
  },

  findByOrderNumber: async (orderNumber) => {
    return await Order.findOne({ orderNumber })
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images');
  },

  getRevenueStats: async (startDate, endDate) => {
    return await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled', 'refunded'] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);
  },

  getOrdersByStatus: async () => {
    return await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  },

  getLast7DaysRevenue: async () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    return await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled', 'refunded'] },
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },
};

export default orderRepository;