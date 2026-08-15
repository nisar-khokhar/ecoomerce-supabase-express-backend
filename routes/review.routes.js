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

const {
  createReviewSchema,
  getProductReviewsSchema,
  updateReviewSchema,
  reviewIdParamSchema,
} = require("../validators/review.validator");

const reviewController = require("../controllers/review.controller");

// ============================================
// Public
// ============================================

router.get(
  "/products/:productId",
  validate(getProductReviewsSchema),
  reviewController.getProductReviews,
);

// ============================================
// Authenticated
// ============================================

router.post(
  "/products/:productId",
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview,
);

router.put(
  "/:id",
  authenticate,
  validate(updateReviewSchema),
  reviewController.updateReview,
);

router.delete(
  "/:id",
  authenticate,
  validate(reviewIdParamSchema),
  reviewController.deleteReview,
);

module.exports = router;
