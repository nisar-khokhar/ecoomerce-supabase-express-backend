const paymentService = require("../services/payment.service");

// ============================================
// Stripe Webhook
// ============================================

const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  try {
    await paymentService.handleStripeWebhook(req.body, signature);

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return res.status(400).json({
      received: false,
      message: error.message,
    });
  }
};

module.exports = {
  stripeWebhook,
};
