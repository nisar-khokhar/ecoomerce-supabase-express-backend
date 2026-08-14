const { z } = require("zod");
const { idSchema } = require("./common.validator");

// ============================================
// Create Order / Checkout
// ============================================

const createOrderSchema = z.object({
  body: z.object({
    shipping_address_id: idSchema,

    billing_address_id: idSchema.optional(),

    coupon_code: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .transform((value) => value.toUpperCase())
      .optional(),
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
    status: z.enum(["processing", "shipped", "delivered"]),
  }),
});

// ============================================
// Admin Get All Orders
// ============================================

const getAdminOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

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

    payment_status: z
      .enum(["pending", "paid", "failed", "refunded", "partially_refunded"])
      .optional(),

    search: z.string().trim().min(1).max(100).optional(),

    date_from: z.coerce.date().optional(),

    date_to: z.coerce.date().optional(),
  }),
});

module.exports = {
  createOrderSchema,
  orderIdParamSchema,
  getOrdersSchema,
  updateOrderStatusSchema,
  getAdminOrdersSchema,
};
