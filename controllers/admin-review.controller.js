/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const asyncHandler = require("../middlewares/asyncHandler");

const adminReviewService = require("../services/admin-review.service");

// ============================================
// Get All Reviews
// ============================================

const getAllReviews = asyncHandler(async (req, res) => {
  const result = await adminReviewService.getAllReviews(req.query);

  return res.status(200).json({
    success: true,
    message: "Reviews fetched successfully.",
    data: result,
  });
});

// ============================================
// Flag Review
// ============================================

const flagReview = asyncHandler(async (req, res) => {
  const review = await adminReviewService.flagReview({
    reviewId: req.params.id,
    adminUserId: req.user.id,
    reason: req.body.reason,
  });

  return res.status(200).json({
    success: true,
    message: "Review flagged successfully.",
    data: review,
  });
});

// ============================================
// Remove Review
// ============================================

const removeReview = asyncHandler(async (req, res) => {
  const review = await adminReviewService.removeReview({
    reviewId: req.params.id,
    adminUserId: req.user.id,
    reason: req.body.reason,
  });

  return res.status(200).json({
    success: true,
    message: "Review removed successfully.",
    data: review,
  });
});

// ============================================
// Restore Review
// ============================================

const restoreReview = asyncHandler(async (req, res) => {
  const review = await adminReviewService.restoreReview({
    reviewId: req.params.id,
    adminUserId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Review restored successfully.",
    data: review,
  });
});

module.exports = {
  getAllReviews,
  flagReview,
  removeReview,
  restoreReview,
};
