const { z } = require("zod");
const { productVariantFieldsSchema } = require("./productVariant.validator");

// const createProductSchema = z.object({
//   body: z
//     .object({
//       category_id: z.coerce.number().int().positive(),

//       brand_id: z.coerce.number().int().positive(),

//       name: z
//         .string()
//         .trim()
//         .min(3, "Product name must be at least 3 characters.")
//         .max(255),

//       slug: z.string().trim().min(3).max(255),

//       short_description: z.string().optional(),

//       description: z.string().optional(),

//       is_active: z.boolean().optional(),

//       is_featured: z.boolean().optional(),

//       variants: z
//         .array(productVariantBodySchema)
//         .min(1, "At least one product variant is required."),
//     })
//     .refine(
//       (data) =>
//         data.compare_price === undefined || data.compare_price >= data.price,
//       {
//         message: "Compare price must be greater than or equal to price.",
//         path: ["compare_price"],
//       },
//     ),
// });

const createProductSchema = z.object({
  body: z.object({
    category_id: z.coerce.number().int().positive(),

    brand_id: z.coerce.number().int().positive(),

    name: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters.")
      .max(255),

    slug: z.string().trim().min(3).max(255),

    short_description: z.string().optional(),

    description: z.string().optional(),

    is_active: z.boolean().optional(),

    is_featured: z.boolean().optional(),

    variants: z
      .array(productVariantFieldsSchema)
      .min(1, "At least one product variant is required."),
  }),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  body: z
    .object({
      category_id: z.coerce.number().int().positive().optional(),

      brand_id: z.coerce.number().int().positive().optional(),

      name: z.string().trim().min(3).max(255).optional(),

      slug: z.string().trim().min(3).max(255).optional(),

      short_description: z.string().optional(),

      description: z.string().optional(),

      is_active: z.boolean().optional(),

      is_featured: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required.",
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required.",
    })
    .refine(
      (data) =>
        data.compare_price === undefined ||
        data.price === undefined ||
        data.compare_price >= data.price,
      {
        message: "Compare price must be greater than or equal to price.",
        path: ["compare_price"],
      },
    ),
});

const getProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().optional(),

    category: z.coerce.number().int().positive().optional(),

    brand: z.coerce.number().int().positive().optional(),

    search: z.string().optional(),

    featured: z.coerce.boolean().optional(),

    active: z.coerce.boolean().optional(),

    sort: z.enum(["price", "name", "created_at"]).optional(),

    order: z.enum(["asc", "desc"]).optional(),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  getProductsSchema,
};
