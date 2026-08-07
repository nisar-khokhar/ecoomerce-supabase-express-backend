const { z } = require("zod");

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(100),

    slug: z.string().trim().min(3).max(100),

    description: z.string().optional(),

    image_path: z.string().optional(),

    sort_order: z.number().int().nonnegative().optional(),

    is_active: z.boolean().optional(),
  }),
});

// const updateCategorySchema = z.object({
//   body: z.object({
//     name: z.string().trim().min(3).max(100).optional(),

//     slug: z.string().trim().min(3).max(100).optional(),

//     description: z.string().optional(),

//     image_path: z.string().optional(),

//     sort_order: z.number().int().nonnegative().optional(),

//     is_active: z.boolean().optional(),
//   }),
// });

// For PATCH, prevent empty requests. We can enforce that with:
const updateCategorySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  body: z
    .object({
      name: z.string().min(3).optional(),
      slug: z.string().min(3).optional(),
      description: z.string().optional(),
      image_path: z.string().optional(),
      sort_order: z.number().int().nonnegative().optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required.",
    }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
