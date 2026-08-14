const asyncHandler = require("../middlewares/asyncHandler");

const adminReportsService = require("../services/admin-reports.service");

// ============================================
// Sales Report
// ============================================

const getSalesReport = asyncHandler(async (req, res) => {
  const report = await adminReportsService.getSalesReport(req.query);

  return res.status(200).json({
    success: true,
    message: "Sales report fetched successfully.",
    data: report,
  });
});

// ============================================
// Orders Report
// ============================================

const getOrdersReport = asyncHandler(async (req, res) => {
  const report = await adminReportsService.getOrdersReport(req.query);

  return res.status(200).json({
    success: true,
    message: "Orders report fetched successfully.",
    data: report,
  });
});

// ============================================
// Product Report
// ============================================

const getProductReport = asyncHandler(async (req, res) => {
  const report = await adminReportsService.getProductReport(req.query);

  return res.status(200).json({
    success: true,
    message: "Product report fetched successfully.",
    data: report,
  });
});

// ============================================
// Inventory Report
// ============================================

const getInventoryReport = asyncHandler(async (req, res) => {
  const report = await adminReportsService.getInventoryReport();

  return res.status(200).json({
    success: true,
    message: "Inventory report fetched successfully.",
    data: report,
  });
});

// ============================================
// Coupon Report
// ============================================

const getCouponReport = asyncHandler(async (req, res) => {
  const report = await adminReportsService.getCouponReport(req.query);

  return res.status(200).json({
    success: true,
    message: "Coupon report fetched successfully.",
    data: report,
  });
});

module.exports = {
  getSalesReport,
  getOrdersReport,
  getProductReport,
  getInventoryReport,
  getCouponReport,
};
