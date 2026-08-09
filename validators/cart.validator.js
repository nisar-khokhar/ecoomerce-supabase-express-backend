const { z } = require("zod");
const { idSchema } = require("./common.validator");

// ============================================
// Add Cart Item
// ============================================

const addCartItemSchema = z.object({
  body: z.object({
    product_variant_id: idSchema,

    quantity: z.coerce
      .number()
      .int("Quantity must be an integer.")
      .positive("Quantity must be greater than zero."),
  }),
});

// ============================================
// Update Cart Item
// ============================================

const updateCartItemSchema = z.object({
  params: z.object({
    variantId: idSchema,
  }),

  body: z.object({
    quantity: z.coerce
      .number()
      .int("Quantity must be an integer.")
      .positive("Quantity must be greater than zero."),
  }),
});

// ============================================
// Cart Item Variant ID
// ============================================

const cartItemVariantIdParamSchema = z.object({
  params: z.object({
    variantId: idSchema,
  }),
});

module.exports = {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemVariantIdParamSchema,
};
