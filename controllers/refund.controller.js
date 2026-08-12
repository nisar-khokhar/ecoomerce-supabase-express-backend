const asyncHandler = require("../middlewares/asyncHandler");

const paymentService = require("../services/payment.service");

// ============================================
// Refund Order
// ============================================

const refundOrder = asyncHandler(async (req, res) => {
  const refund = await paymentService.refundOrder({
    orderId: req.params.id,
    reason: req.body.reason,
  });

  return res.status(201).json({
    success: true,
    message: "Refund initiated successfully.",
    data: refund,
  });
});

module.exports = {
  refundOrder,
};
