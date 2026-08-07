const { z } = require("zod");

const idParamSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({
        invalid_type_error: "ID must be a number.",
      })
      .int("ID must be an integer.")
      .positive("ID must be greater than 0."),
  }),
});

module.exports = {
  idParamSchema,
};
