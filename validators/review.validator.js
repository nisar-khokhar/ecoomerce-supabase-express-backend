const { z } = require("zod");
const { idSchema } = require("./common.validator");

const reviewIdParamSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// ============================================
// Product ID
// ============================================

const productIdParamSchema = z.object({
  params: z.object({
    productId: idSchema,
  }),
});

// ============================================
// Create Review
// ============================================

const createReviewSchema = z.object({
  params: z.object({
    productId: idSchema,
  }),

  body: z.object({
    rating: z.number().int().min(1).max(5),

    title: z.string().trim().max(150).optional(),

    review: z.string().trim().max(2000).optional(),
  }),
});
// ============================================
// Get Product Reviews
// ============================================

const getProductReviewsSchema = z.object({
  params: z.object({
    productId: idSchema,
  }),

  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(50).optional(),

    rating: z.coerce.number().int().min(1).max(5).optional(),
  }),
});

// ============================================
// Update Review
// ============================================

const updateReviewSchema = z.object({
  params: z.object({
    id: idSchema,
  }),

  body: z
    .object({
      rating: z.number().int().min(1).max(5).optional(),

      title: z.string().trim().max(150).optional(),

      review: z.string().trim().max(2000).optional(),
    })
    .refine(
      (body) =>
        body.rating !== undefined ||
        body.title !== undefined ||
        body.review !== undefined,
      {
        message: "At least one field must be provided.",
      },
    ),
});

module.exports = {
  productIdParamSchema,
  createReviewSchema,
  getProductReviewsSchema,
  updateReviewSchema,
  reviewIdParamSchema,
};
