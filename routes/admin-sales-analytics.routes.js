/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const authorize = require("../middlewares/authorize");

const adminSalesAnalyticsController = require("../controllers/admin-sales-analytics.controller");

router.use(authenticate);

// ============================================
// Admin Sales Analytics
// ============================================

router.get(
  "/sales",
  authorize("admin"),
  adminSalesAnalyticsController.getSalesAnalytics,
);

module.exports = router;
