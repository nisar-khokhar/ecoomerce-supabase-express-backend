const { z } = require("zod");

/**
 * POST /wishlist
 */
const createWishlistSchema = z.object({
  body: z.object({
    product_id: z.coerce
      .number()
      .int()
      .positive("Product id must be a positive integer."),
  }),
});

/**
 * DELETE /wishlist/:productId
 */
const productIdParamSchema = z.object({
  params: z.object({
    productId: z.coerce
      .number()
      .int()
      .positive("Product id must be a positive integer."),
  }),
});

module.exports = {
  createWishlistSchema,
  productIdParamSchema,
};
