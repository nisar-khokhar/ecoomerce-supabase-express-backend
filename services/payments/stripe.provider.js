const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================
// Create Payment
// ============================================

const createPayment = async ({
  paymentId,
  orderId,
  orderNumber,
  amount,
  currency,
  customer,
}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency: currency.toLowerCase(),

    metadata: {
      payment_id: String(paymentId),
      order_id: String(orderId),
      order_number: orderNumber,
    },

    receipt_email: customer?.email || undefined,
  });

  return {
    providerPaymentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
  };
};

// ============================================
// Verify Webhook
// ============================================

const verifyWebhook = async (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
};

// ============================================
// Get Payment Status
// ============================================

const getPaymentStatus = async (providerPaymentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(providerPaymentId);

  return {
    providerPaymentId: paymentIntent.id,
    status: paymentIntent.status,
  };
};

module.exports = {
  createPayment,
  verifyWebhook,
  getPaymentStatus,
};
