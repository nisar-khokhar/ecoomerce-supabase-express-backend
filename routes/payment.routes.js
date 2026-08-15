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

const paymentController = require("../controllers/payment.controller");
const { paymentRateLimiter } = require("../middlewares/rateLimiter");

router.use(authenticate);

// Initialize payment for an existing order
router.post(
  "/orders/:orderId",
  paymentRateLimiter,
  paymentController.createPayment,
);

module.exports = router;
