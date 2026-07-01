import adminService from '../services/admin.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get Dashboard Stats
// ─────────────────────────────────────────
export const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// ─────────────────────────────────────────
// Get Revenue Chart
// ─────────────────────────────────────────
export const getRevenueChart = catchAsync(async (req, res) => {
  const { range = '7' } = req.query;
  const data = await adminService.getRevenueChart(range);
  res.status(200).json({
    success: true,
    data: { chart: data },
  });
});