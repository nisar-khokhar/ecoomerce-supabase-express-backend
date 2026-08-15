/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const { z } = require("zod");
const { idSchema } = require("./common.validator");

// ============================================
// Get Admin Reviews
// ============================================

const getAdminReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    moderation_status: z.enum(["published", "flagged", "removed"]).optional(),

    rating: z.coerce.number().int().min(1).max(5).optional(),
  }),
});

// ============================================
// Moderate Review
// ============================================

const moderateReviewSchema = z.object({
  params: z.object({
    id: idSchema,
  }),

  body: z.object({
    reason: z.string().trim().min(3).max(500),
  }),
});

// ============================================
// Restore Review
// ============================================

const restoreReviewSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

module.exports = {
  getAdminReviewsSchema,
  moderateReviewSchema,
  restoreReviewSchema,
};
