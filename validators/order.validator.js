const { z } = require("zod");
const { idSchema } = require("./common.validator");

// ============================================
// Create Order / Checkout
// ============================================

const createOrderSchema = z.object({
  body: z.object({
    shipping_address_id: idSchema,

    billing_address_id: idSchema.optional(),
  }),
});

// ============================================
// Order ID
// ============================================

const orderIdParamSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// ============================================
// Get User Orders
// ============================================

const getOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().optional(),

    // Order fulfillment status
    status: z
      .enum([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .optional(),

    // Payment lifecycle status
    payment_status: z
      .enum(["pending", "paid", "failed", "refunded", "partially_refunded"])
      .optional(),
  }),
});

// ============================================
// Update Order Status
// ============================================

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: idSchema,
  }),

  body: z.object({
    status: z.enum([
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  }),
});

module.exports = {
  createOrderSchema,
  orderIdParamSchema,
  getOrdersSchema,
  updateOrderStatusSchema,
};
