const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
  createCouponSchema,
  couponIdParamSchema,
  getCouponsSchema,
  updateCouponSchema,
} = require("../validators/coupon.validator");

const couponController = require("../controllers/coupon.controller");

router.use(authenticate);

// ============================================
// Admin Coupon Routes
// ============================================

router.post(
  "/",
  authorize("admin"),
  validate(createCouponSchema),
  couponController.createCoupon,
);

router.get(
  "/",
  authorize("admin"),
  validate(getCouponsSchema),
  couponController.getAllCoupons,
);

router.get(
  "/:id",
  authorize("admin"),
  validate(couponIdParamSchema),
  couponController.getCouponById,
);

router.patch(
  "/:id",
  authorize("admin"),
  validate(updateCouponSchema),
  couponController.updateCoupon,
);

router.delete(
  "/:id",
  authorize("admin"),
  validate(couponIdParamSchema),
  couponController.deactivateCoupon,
);

module.exports = router;
