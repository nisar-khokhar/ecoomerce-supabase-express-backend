/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

// const { z } = require("zod");
// const {
//   idSchema,
//   idParamSchema,
//   positiveNumberSchema,
//   nonNegativeIntegerSchema,
// } = require("./common.validator");

// const productVariantBodySchema = z.object({
//   product_id: idSchema,

//   sku: z
//     .string()
//     .trim()
//     .min(1, "SKU is required.")
//     .max(100, "SKU cannot exceed 100 characters."),

//   barcode: z.string().trim().max(100).nullable().optional(),

//   price: positiveNumberSchema,

//   compare_price: positiveNumberSchema.nullable().optional(),

//   quantity: nonNegativeIntegerSchema,

//   weight: positiveNumberSchema.nullable().optional(),

//   track_inventory: z.boolean().default(true),

//   is_active: z.boolean().default(true),

//   variant_value_ids: z
//     .array(idSchema)
//     .min(1, "At least one variant value is required."),
// });

// const createProductVariantSchema = z.object({
//   body: productVariantBodySchema.refine(
//     (data) => data.compare_price == null || data.compare_price >= data.price,
//     {
//       message: "Compare price must be greater than or equal to price.",
//       path: ["compare_price"],
//     },
//   ),
// });

// const updateProductVariantSchema = z.object({
//   params: idParamSchema.shape.params,
//   body: productVariantBodySchema.partial(),
// });

// module.exports = {
//   createProductVariantSchema,
//   updateProductVariantSchema,
//   productVariantIdParamSchema: idParamSchema,
// };

const { z } = require("zod");
const {
  idSchema,
  idParamSchema,
  positiveNumberSchema,
  nonNegativeIntegerSchema,
} = require("./common.validator");

// ============================================
// Shared Variant Fields
// ============================================

const productVariantFieldsSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required.")
    .max(100, "SKU cannot exceed 100 characters."),

  barcode: z
    .string()
    .trim()
    .max(100, "Barcode cannot exceed 100 characters.")
    .nullable()
    .optional(),

  price: positiveNumberSchema,

  compare_price: positiveNumberSchema.nullable().optional(),

  quantity: nonNegativeIntegerSchema,

  weight: positiveNumberSchema.nullable().optional(),

  track_inventory: z.boolean().default(true),

  is_active: z.boolean().default(true),

  variant_value_ids: z
    .array(idSchema)
    .min(1, "At least one variant value is required."),
});

// ============================================
// Create Product Variant
// ============================================

const createProductVariantSchema = z.object({
  params: z.object({}).optional(),

  body: productVariantFieldsSchema.extend({
    product_id: idSchema,
  }),
});

// ============================================
// Update Product Variant
// ============================================

const updateProductVariantSchema = z.object({
  params: idParamSchema.shape.params,

  body: productVariantFieldsSchema.partial(),
});

// ============================================
// ID
// ============================================

const productVariantIdParamSchema = idParamSchema;

module.exports = {
  productVariantFieldsSchema,
  createProductVariantSchema,
  updateProductVariantSchema,
  productVariantIdParamSchema,
};
