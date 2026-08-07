const { z } = require("zod");

const createBrandSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),

    slug: z.string().trim().min(2).max(100),

    description: z.string().optional(),

    logo_path: z.string().optional(),

    website: z.url().optional(),

    is_active: z.boolean().optional(),
  }),
});

const updateBrandSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),

      slug: z.string().trim().min(2).max(100).optional(),

      description: z.string().optional(),

      logo_path: z.string().optional(),

      website: z.url().optional(),

      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided.",
    }),
});

module.exports = {
  createBrandSchema,
  updateBrandSchema,
};
