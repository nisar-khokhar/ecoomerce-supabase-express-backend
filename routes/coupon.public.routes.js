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
const validate = require("../middlewares/validate");

const { validateCouponSchema } = require("../validators/coupon.validator");

const couponController = require("../controllers/coupon.controller");
const { couponRateLimiter } = require("../middlewares/rateLimiter");

router.use(authenticate);

// ============================================
// Customer Coupon Validation
// ============================================

router.post(
  "/validate",
  couponRateLimiter,
  validate(validateCouponSchema),
  couponController.validateCoupon,
);

module.exports = router;
