const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const adminDashboardController = require("../controllers/admin-dashboard.controller");

router.use(authenticate);

// ============================================
// Admin Dashboard
// ============================================

router.get("/", authorize("admin"), adminDashboardController.getDashboard);

module.exports = router;
