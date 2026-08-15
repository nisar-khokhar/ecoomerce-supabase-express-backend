/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const { z } = require("zod");

/**
 * Update Profile
 */
const updateProfileSchema = z.object({
  body: z
    .object({
      first_name: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters.")
        .max(100)
        .optional(),

      last_name: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters.")
        .max(100)
        .optional(),

      phone: z
        .string()
        .trim()
        .min(10, "Phone number is too short.")
        .max(15, "Phone number is too long.")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided.",
    }),
});

const changePasswordSchema = z.object({
  body: z.object({
    current_password: z.string().min(1, "Current password is required."),

    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain uppercase, lowercase, number and special character.",
      ),
  }),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
};
