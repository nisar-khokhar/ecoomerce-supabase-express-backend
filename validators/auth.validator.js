const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    first_name: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(100),

    last_name: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .max(100),

    email: z.string().trim().email("Invalid email address."),

    phone: z.string().trim().min(10).max(15).optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain uppercase, lowercase, number and special character.",
      ),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address."),

    password: z.string().min(1, "Password is required."),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
