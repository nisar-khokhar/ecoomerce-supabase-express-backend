/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const { z } = require("zod");

const createAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().min(2).max(50),

    recipient_name: z.string().trim().min(2).max(100),

    phone: z.string().trim().min(10).max(15),

    address_line_1: z.string().trim().min(5).max(255),

    address_line_2: z.string().trim().max(255).optional(),

    city: z.string().trim().min(2).max(100),

    province: z.string().trim().min(2).max(100),

    postal_code: z.string().trim().max(20).optional(),

    country_code: z.string().trim().length(2),

    delivery_notes: z.string().trim().max(500).optional(),
  }),
});

const updateAddressSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      label: z.string().trim().min(2).max(50).optional(),
      recipient_name: z.string().trim().min(2).max(100).optional(),
      phone: z.string().trim().min(10).max(15).optional(),
      address_line_1: z.string().trim().min(5).max(255).optional(),
      address_line_2: z.string().trim().max(255).optional(),
      city: z.string().trim().min(2).max(100).optional(),
      province: z.string().trim().min(2).max(100).optional(),
      postal_code: z.string().trim().max(20).optional(),
      country_code: z.string().trim().length(2).optional(),
      delivery_notes: z.string().trim().max(500).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided.",
    }),
});

module.exports = {
  createAddressSchema,
  updateAddressSchema,
};
