import adminRepository from '../repositories/admin.repository.js';

// ─────────────────────────────────────────
// Get Dashboard Stats
// ─────────────────────────────────────────
const getDashboardStats = async () => {
  const [
    overview,
    revenue,
    ordersByStatus,
    last7DaysRevenue,
    topProducts,
    recentOrders,
    newUsersThisMonth,
    lowStockProducts,
    categoryWiseSales,
  ] = await Promise.all([
    adminRepository.getOverviewStats(),
    adminRepository.getRevenueStats(),
    adminRepository.getOrdersByStatus(),
    adminRepository.getLast7DaysRevenue(),
    adminRepository.getTopSellingProducts(5),
    adminRepository.getRecentOrders(10),
    adminRepository.getNewUsersThisMonth(),
    adminRepository.getLowStockProducts(10),
    adminRepository.getCategoryWiseSales(),
  ]);

  return {
    overview: {
      ...overview,
      newUsersThisMonth,
    },
    revenue,
    ordersByStatus,
    charts: {
      last7DaysRevenue,
    },
    topProducts,
    recentOrders,
    lowStockProducts,
    categoryWiseSales,
  };
};

// ─────────────────────────────────────────
// Get Revenue Chart (Custom Range)
// ─────────────────────────────────────────
const getRevenueChart = async (range = '7') => {
  if (range === '30') {
    return await adminRepository.getLast30DaysRevenue();
  }
  return await adminRepository.getLast7DaysRevenue();
};

const adminService = {
  getDashboardStats,
  getRevenueChart,
};

export default adminService;