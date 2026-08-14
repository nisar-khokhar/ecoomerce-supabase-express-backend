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
