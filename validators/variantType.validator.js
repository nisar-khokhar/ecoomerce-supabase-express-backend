/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const { z } = require("zod");
const { idParamSchema } = require("./common.validator");

const variantTypeBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Variant type name is required.")
    .max(50, "Variant type name cannot exceed 50 characters."),
});

const createVariantTypeSchema = z.object({
  body: variantTypeBodySchema,
});

const updateVariantTypeSchema = z.object({
  params: idParamSchema.shape.params,
  body: variantTypeBodySchema,
});

module.exports = {
  createVariantTypeSchema,
  updateVariantTypeSchema,
  variantTypeIdParamSchema: idParamSchema,
};
