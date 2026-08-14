const { z } = require("zod");
const { idSchema } = require("./common.validator");

// ============================================
// Create Coupon
// ============================================

const createCouponSchema = z.object({
  body: z
    .object({
      code: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .transform((value) => value.toUpperCase()),

      description: z.string().trim().max(500).optional(),

      discount_type: z.enum(["percentage", "fixed"]),

      discount_value: z.coerce.number().positive(),

      minimum_order_amount: z.coerce.number().nonnegative().optional(),

      maximum_discount_amount: z.coerce
        .number()
        .positive()
        .nullable()
        .optional(),

      usage_limit: z.coerce.number().int().positive().nullable().optional(),

      usage_limit_per_user: z.coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

      first_order_only: z.boolean().optional(),

      starts_at: z.coerce.date().nullable().optional(),

      expires_at: z.coerce.date().nullable().optional(),

      is_active: z.boolean().optional(),

      product_ids: z.array(idSchema).optional(),

      category_ids: z.array(idSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.discount_type === "percentage" && data.discount_value > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discount_value"],
          message: "Percentage discount cannot exceed 100.",
        });
      }

      if (
        data.starts_at &&
        data.expires_at &&
        data.expires_at <= data.starts_at
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expires_at"],
          message: "Expiry date must be after start date.",
        });
      }
    }),
});

// ============================================
// Coupon ID
// ============================================

const couponIdParamSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// ============================================
// Get Coupons
// ============================================

const getCouponsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    is_active: z
      .string()
      .transform((value) =>
        value === "true" ? true : value === "false" ? false : value,
      )
      .pipe(z.boolean())
      .optional(),

    search: z.string().trim().max(100).optional(),
  }),
});

// ============================================
// Update Coupon
// ============================================

const updateCouponSchema = z.object({
  params: z.object({
    id: idSchema,
  }),

  body: z
    .object({
      code: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .transform((value) => value.toUpperCase())
        .optional(),

      description: z.string().trim().max(500).nullable().optional(),

      discount_type: z.enum(["percentage", "fixed"]).optional(),

      discount_value: z.coerce.number().positive().optional(),

      minimum_order_amount: z.coerce.number().nonnegative().optional(),

      maximum_discount_amount: z.coerce
        .number()
        .positive()
        .nullable()
        .optional(),

      usage_limit: z.coerce.number().int().positive().nullable().optional(),

      usage_limit_per_user: z.coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

      first_order_only: z.boolean().optional(),

      starts_at: z.coerce.date().nullable().optional(),

      expires_at: z.coerce.date().nullable().optional(),

      is_active: z.boolean().optional(),

      product_ids: z.array(idSchema).optional(),

      category_ids: z.array(idSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.discount_type === "percentage" &&
        data.discount_value !== undefined &&
        data.discount_value > 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discount_value"],
          message: "Percentage discount cannot exceed 100.",
        });
      }

      if (
        data.starts_at &&
        data.expires_at &&
        data.expires_at <= data.starts_at
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expires_at"],
          message: "Expiry date must be after start date.",
        });
      }
    }),
});

// ============================================
// Validate Coupon
// ============================================

const validateCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .transform((value) => value.toUpperCase()),
  }),
});

module.exports = {
  createCouponSchema,
  couponIdParamSchema,
  getCouponsSchema,
  updateCouponSchema,
  validateCouponSchema,
};
