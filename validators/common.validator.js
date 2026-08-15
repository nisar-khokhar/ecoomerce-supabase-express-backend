/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const { z } = require("zod");

const idSchema = z.coerce
  .number({
    invalid_type_error: "ID must be a number.",
  })
  .int("ID must be an integer.")
  .positive("ID must be greater than 0.");

const idParamSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

const positiveNumberSchema = z.coerce
  .number()
  .positive("Value must be greater than zero.");

const nonNegativeIntegerSchema = z.coerce
  .number()
  .int()
  .min(0, "Value cannot be negative.");

module.exports = {
  idSchema,
  idParamSchema,
  positiveNumberSchema,
  nonNegativeIntegerSchema,
};
