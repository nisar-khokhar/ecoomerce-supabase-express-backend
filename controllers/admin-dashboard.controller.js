/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

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
