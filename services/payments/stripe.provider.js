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

    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },

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
// Get Charge With Refunds
// ============================================

const getChargeWithRefunds = async (chargeId) => {
  const charge = await stripe.charges.retrieve(chargeId, {
    expand: ["refunds.data"],
  });

  return charge;
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

// ============================================
// Create Refund
// ============================================

const createRefund = async ({ providerPaymentId, amount }) => {
  const refund = await stripe.refunds.create({
    payment_intent: providerPaymentId,
    amount: amount ? Math.round(Number(amount) * 100) : undefined,
  });

  return {
    providerRefundId: refund.id,
    providerPaymentId: providerPaymentId,
    amount: refund.amount,
    currency: refund.currency,
    status: refund.status,
  };
};

module.exports = {
  createPayment,
  verifyWebhook,
  getPaymentStatus,
  createRefund,
  getChargeWithRefunds,
};
