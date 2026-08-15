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

const adminDashboardController = require("../controllers/admin-dashboard.controller");

router.use(authenticate);

// ============================================
// Admin Dashboard
// ============================================

router.get("/", authorize("admin"), adminDashboardController.getDashboard);

module.exports = router;
