const asyncHandler = require("../middlewares/asyncHandler");
const adminDashboardService = require("../services/admin-dashboard.service");

// ============================================
// Admin Dashboard
// ============================================

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await adminDashboardService.getDashboard();

  return res.status(200).json({
    success: true,
    message: "Admin dashboard fetched successfully.",
    data: dashboard,
  });
});

module.exports = {
  getDashboard,
};
