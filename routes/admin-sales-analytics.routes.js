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
