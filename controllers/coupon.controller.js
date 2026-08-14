const asyncHandler = require("../middlewares/asyncHandler");
const couponService = require("../services/coupon.service");

// ============================================
// Create Coupon
// ============================================

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);

  return res.status(201).json({
    success: true,
    message: "Coupon created successfully.",
    data: coupon,
  });
});

// ============================================
// Get All Coupons
// ============================================

const getAllCoupons = asyncHandler(async (req, res) => {
  const result = await couponService.getAllCoupons(req.query);

  return res.status(200).json({
    success: true,
    message: "Coupons fetched successfully.",
    data: result,
  });
});

// ============================================
// Get Coupon By ID
// ============================================

const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Coupon fetched successfully.",
    data: coupon,
  });
});

// ============================================
// Update Coupon
// ============================================

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: "Coupon updated successfully.",
    data: coupon,
  });
});

// ============================================
// Deactivate Coupon
// ============================================

const deactivateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.deactivateCoupon(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Coupon deactivated successfully.",
    data: coupon,
  });
});

// ============================================
// Validate Coupon
// ============================================

const validateCoupon = asyncHandler(async (req, res) => {
  const result = await couponService.validateCoupon({
    userId: req.user.id,
    code: req.body.code,
  });

  return res.status(200).json({
    success: true,
    message: "Coupon applied successfully.",
    data: result,
  });
});

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deactivateCoupon,
  validateCoupon,
};
