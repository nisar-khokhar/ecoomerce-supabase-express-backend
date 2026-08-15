/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const asyncHandler = require("../middlewares/asyncHandler");

const adminSalesAnalyticsService = require("../services/admin-sales-analytics.service");

// ============================================
// Sales Analytics
// ============================================

const getSalesAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminSalesAnalyticsService.getSalesAnalytics();

  return res.status(200).json({
    success: true,
    message: "Sales analytics fetched successfully.",
    data: analytics,
  });
});

module.exports = {
  getSalesAnalytics,
};
