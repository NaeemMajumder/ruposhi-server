import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import Review from '../models/Review.model.js';
import Newsletter from '../models/Newsletter.model.js';

const adminRepository = {
  // ─────────────────────────────────────────
  // Overview Stats
  // ─────────────────────────────────────────
  getOverviewStats: async () => {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingReviews,
      activeSubscribers,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Review.countDocuments({ isApproved: false }),
      Newsletter.countDocuments({ isActive: true }),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingReviews,
      activeSubscribers,
    };
  },

  // ─────────────────────────────────────────
  // Revenue Stats
  // ─────────────────────────────────────────
  getRevenueStats: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalRevenue, thisMonthRevenue, lastMonthRevenue] =
      await Promise.all([
        // Total revenue
        Order.aggregate([
          { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),

        // This month revenue
        Order.aggregate([
          {
            $match: {
              status: { $nin: ['cancelled', 'refunded'] },
              createdAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),

        // Last month revenue
        Order.aggregate([
          {
            $match: {
              status: { $nin: ['cancelled', 'refunded'] },
              createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth,
              },
            },
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ]);

    const thisMonth = thisMonthRevenue[0]?.total || 0;
    const lastMonth = lastMonthRevenue[0]?.total || 0;

    // Growth percentage
    const growth =
      lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : 100;

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      thisMonthRevenue: thisMonth,
      lastMonthRevenue: lastMonth,
      revenueGrowth: growth,
    };
  },

  // ─────────────────────────────────────────
  // Orders by Status
  // ─────────────────────────────────────────
  getOrdersByStatus: async () => {
    const stats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    return result;
  },

  // ─────────────────────────────────────────
  // Last 7 Days Revenue Chart
  // ─────────────────────────────────────────
  getLast7DaysRevenue: async () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const data = await Order.aggregate([
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

    // সব ৭টা দিন fill করো (empty দিন = 0)
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const found = data.find((d) => d._id === dateStr);
      result.push({
        date: dateStr,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }

    return result;
  },

  // ─────────────────────────────────────────
  // Last 30 Days Revenue Chart
  // ─────────────────────────────────────────
  getLast30DaysRevenue: async () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const data = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled', 'refunded'] },
          createdAt: { $gte: last30Days },
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

    return data;
  },

  // ─────────────────────────────────────────
  // Top Selling Products
  // ─────────────────────────────────────────
  getTopSellingProducts: async (limit = 5) => {
    return await Product.find({ isActive: true })
      .sort({ totalSold: -1 })
      .limit(limit)
      .populate('category', 'name')
      .select('name slug images price totalSold ratings');
  },

  // ─────────────────────────────────────────
  // Recent Orders
  // ─────────────────────────────────────────
  getRecentOrders: async (limit = 10) => {
    return await Order.find()
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .limit(limit)
      .select(
        'orderNumber user totalAmount status paymentMethod createdAt'
      );
  },

  // ─────────────────────────────────────────
  // New Users This Month
  // ─────────────────────────────────────────
  getNewUsersThisMonth: async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfMonth },
    });
  },

  // ─────────────────────────────────────────
  // Low Stock Products
  // ─────────────────────────────────────────
  getLowStockProducts: async (threshold = 10) => {
    return await Product.find({
      isActive: true,
      stock: { $lte: threshold },
    })
      .sort({ stock: 1 })
      .limit(10)
      .select('name slug stock images');
  },

  // ─────────────────────────────────────────
  // Category wise Sales
  // ─────────────────────────────────────────
  getCategoryWiseSales: async () => {
    return await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);
  },
};

export default adminRepository;