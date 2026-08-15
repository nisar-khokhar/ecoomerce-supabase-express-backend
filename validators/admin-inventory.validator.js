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
// Get Inventory
// ============================================

const getInventorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    search: z.string().trim().max(100).optional(),

    lowStock: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  }),
});

// ============================================
// Inventory Variant ID
// ============================================

const inventoryVariantIdSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// ============================================
// Update Inventory
// ============================================

const updateInventorySchema = z.object({
  params: z.object({
    id: idSchema,
  }),

  body: z.object({
    quantity: z.number().int().min(0),

    type: z.enum(["restock", "manual_adjustment"]),

    reason: z.string().trim().min(3).max(500),
  }),
});

const getInventoryMovementsSchema = z.object({
  params: z.object({
    id: idSchema,
  }),

  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    type: z
      .enum(["sale", "restock", "manual_adjustment", "return", "cancellation"])
      .optional(),
  }),
});

module.exports = {
  getInventorySchema,
  inventoryVariantIdSchema,
  updateInventorySchema,
  getInventoryMovementsSchema,
};
