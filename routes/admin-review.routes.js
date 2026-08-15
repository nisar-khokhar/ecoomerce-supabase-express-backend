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
const validate = require("../middlewares/validate");

const {
  getAdminReviewsSchema,
  moderateReviewSchema,
  restoreReviewSchema,
} = require("../validators/admin-review.validator");

const {
  getAllReviews,
  removeReview,
  restoreReview,
  flagReview,
} = require("../controllers/admin-review.controller");

// ============================================
// Admin Authentication
// ============================================

router.use(authenticate);

router.use(authorize("admin"));

// ============================================
// Get Reviews
// ============================================

router.get("/", validate(getAdminReviewsSchema), getAllReviews);

// ============================================
// Flag Review
// ============================================

router.patch("/:id/flag", validate(moderateReviewSchema), flagReview);

// ============================================
// Remove Review
// ============================================

router.patch("/:id/remove", validate(moderateReviewSchema), removeReview);

// ============================================
// Restore Review
// ============================================

router.patch("/:id/restore", validate(restoreReviewSchema), restoreReview);

module.exports = router;
