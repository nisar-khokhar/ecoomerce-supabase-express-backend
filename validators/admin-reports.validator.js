/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const { z } = require("zod");

// ============================================
// Report Date Range
// ============================================

const reportDateRangeSchema = z.object({
  query: z
    .object({
      from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD")
        .optional(),

      to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD")
        .optional(),
    })
    .refine(
      ({ from, to }) => {
        if (!from || !to) {
          return true;
        }

        return from <= to;
      },
      {
        message: "'from' date cannot be after 'to' date.",
        path: ["from"],
      },
    ),
});

module.exports = {
  reportDateRangeSchema,
};
