/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const { z } = require("zod");
const { idParamSchema, idSchema } = require("./common.validator");

const variantValueBodySchema = z.object({
  variant_type_id: idSchema,

  value_code: z
    .string()
    .trim()
    .min(1, "Value code is required.")
    .max(50, "Value code cannot exceed 50 characters."),

  label: z
    .string()
    .trim()
    .min(1, "Label is required.")
    .max(100, "Label cannot exceed 100 characters."),
});

const createVariantValueSchema = z.object({
  body: variantValueBodySchema,
});

const updateVariantValueSchema = z.object({
  params: idParamSchema.shape.params,
  body: variantValueBodySchema,
});

module.exports = {
  createVariantValueSchema,
  updateVariantValueSchema,
  variantValueIdParamSchema: idParamSchema,
};
