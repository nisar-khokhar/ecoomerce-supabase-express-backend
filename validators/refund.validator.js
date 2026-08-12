const { z } = require("zod");
const { idSchema } = require("./common.validator");

// ============================================
// Refund Order
// ============================================

const refundOrderSchema = z.object({
  params: z.object({
    id: idSchema,
  }),

  body: z.object({
    amount: z.coerce.number().positive().optional(),

    reason: z.string().trim().min(3).max(500).optional(),
  }),
});

module.exports = {
  refundOrderSchema,
};
