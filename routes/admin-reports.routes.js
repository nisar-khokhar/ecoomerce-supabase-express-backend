const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
  reportDateRangeSchema,
} = require("../validators/admin-reports.validator");

const {
  getSalesReport,
  getOrdersReport,
  getProductReport,
  getInventoryReport,
  getCouponReport,
} = require("../controllers/admin-reports.controller");

// ============================================
// Admin Authentication
// ============================================

router.use(authenticate);

router.use(authorize("admin"));

// ============================================
// Reports
// ============================================

router.get("/sales", validate(reportDateRangeSchema), getSalesReport);

router.get("/orders", validate(reportDateRangeSchema), getOrdersReport);

router.get("/products", validate(reportDateRangeSchema), getProductReport);

router.get("/inventory", getInventoryReport);

router.get("/coupons", validate(reportDateRangeSchema), getCouponReport);

module.exports = router;
