/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const asyncHandler = require("../middlewares/asyncHandler");

const reviewService = require("../services/review.service");

// ============================================
// Create Review
// ============================================

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview({
    userId: req.user.id,
    productId: req.params.productId,
    rating: req.body.rating,
    title: req.body.title,
    review: req.body.review,
  });

  return res.status(201).json({
    success: true,
    message: "Review created successfully.",
    data: review,
  });
});

// ============================================
// Get Product Reviews
// ============================================

const getProductReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(
    req.params.productId,
    req.query,
  );

  return res.status(200).json({
    success: true,
    message: "Product reviews fetched successfully.",
    data: result,
  });
});

// ============================================
// Update Review
// ============================================

const updateReview = asyncHandler(async (req, res) => {
  const updatedReview = await reviewService.updateReview({
    userId: req.user.id,
    reviewId: req.params.id,
    rating: req.body.rating,
    title: req.body.title,
    review: req.body.review,
  });

  return res.status(200).json({
    success: true,
    message: "Review updated successfully.",
    data: updatedReview,
  });
});

// ============================================
// Delete Review
// ============================================

const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview({
    userId: req.user.id,
    reviewId: req.params.id,
  });

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
  });
});

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
};
