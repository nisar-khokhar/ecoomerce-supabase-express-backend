const supabase = require("../config/supabase");

const stripeProvider = require("./payments/stripe.provider");
const xpayProvider = require("./payments/xpay.provider");

// ============================================
// Payment Providers
// ============================================

const providers = {
  stripe: stripeProvider,
  xpay: xpayProvider,
};

// ============================================
// Get Active Provider
// ============================================

const getPaymentProvider = () => {
  const providerName = process.env.PAYMENT_PROVIDER;

  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Unsupported payment provider: ${providerName}.`);
  }

  return {
    name: providerName,
    provider,
  };
};

// ============================================
// Create Payment Record
// ============================================

const createPaymentRecord = async ({ orderId, provider, amount, currency }) => {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      order_id: orderId,
      provider,
      amount,
      currency,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error("Unable to create payment.");
  }

  return data;
};

// ============================================
// Update Payment Record
// ============================================

const updatePaymentRecord = async (paymentId, paymentData) => {
  const { data, error } = await supabase
    .from("payments")
    .update(paymentData)
    .eq("id", paymentId)
    .select()
    .single();

  if (error) {
    console.error("SUPABASE PAYMENT UPDATE ERROR:", error);

    throw new Error(`Unable to update payment: ${error.message}`);
  }

  return data;
};

// ============================================
// Fulfill Paid Order
// ============================================

const fulfillPaidOrder = async (orderId, paymentId) => {
  const { error } = await supabase.rpc("fulfill_paid_order", {
    p_order_id: orderId,
    p_payment_id: paymentId,
  });

  if (error) {
    console.error("ORDER FULFILLMENT ERROR:", error);

    throw new Error(`Unable to fulfill order: ${error.message}`);
  }
};

// ============================================
// Get Payment By Provider Payment ID
// ============================================

const getPaymentByProviderPaymentId = async (provider, providerPaymentId) => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("provider", provider)
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch payment.");
  }

  if (!data) {
    throw new Error("Payment not found.");
  }

  return data;
};

// ============================================
// Create Payment
// ============================================
// Lower-level payment creation.
// This function trusts values supplied by the
// internal application service.
//
// DO NOT expose this directly to the client.

const createPayment = async ({
  orderId,
  orderNumber,
  amount,
  currency,
  customer,
}) => {
  const { name: providerName, provider } = getPaymentProvider();

  // Create internal payment record first
  const payment = await createPaymentRecord({
    orderId,
    provider: providerName,
    amount,
    currency,
  });

  try {
    // Create payment with external provider
    const providerPayment = await provider.createPayment({
      paymentId: payment.id,
      orderId,
      orderNumber,
      amount,
      currency,
      customer,
    });

    // Save provider information
    const updatedPayment = await updatePaymentRecord(payment.id, {
      provider_payment_id: providerPayment.providerPaymentId,

      provider_response: providerPayment,
    });

    return {
      payment: updatedPayment,
      providerData: providerPayment,
    };
  } catch (error) {
    await updatePaymentRecord(payment.id, {
      status: "failed",

      provider_response: {
        error: error.message,
      },
    });

    throw error;
  }
};

// ============================================
// Create Payment For Order
// ============================================
// Public application-level payment function.
//
// Client provides only order ID.
// Amount comes from our database.

const createPaymentForOrder = async ({ userId, orderId, customer }) => {
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      order_number,
      status,
      payment_status,
      total_amount
    `,
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch order.");
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.payment_status === "paid") {
    throw new Error("Order has already been paid.");
  }

  if (order.status === "cancelled") {
    throw new Error("Cancelled orders cannot be paid.");
  }

  if (Number(order.total_amount) <= 0) {
    throw new Error("Invalid order amount.");
  }

  return await createPayment({
    orderId: order.id,
    orderNumber: order.order_number,
    amount: order.total_amount,
    currency: "PKR",
    customer,
  });
};

// ============================================
// Handle Stripe Webhook
// ============================================

const handleStripeWebhook = async (payload, signature) => {
  const stripeEvent = await stripeProvider.verifyWebhook(payload, signature);

  switch (stripeEvent.type) {
    case "payment_intent.succeeded":
      await handleStripePaymentSucceeded(stripeEvent.data.object);
      break;

    case "payment_intent.payment_failed":
      await handleStripePaymentFailed(stripeEvent.data.object);
      break;

    default:
      console.log(`Unhandled Stripe event: ${stripeEvent.type}`);
  }
};

// ============================================
// Stripe Payment Succeeded
// ============================================

const handleStripePaymentSucceeded = async (paymentIntent) => {
  const payment = await getPaymentByProviderPaymentId(
    "stripe",
    paymentIntent.id,
  );

  // ==========================================
  // Verify Amount
  // ==========================================

  const expectedAmount = Math.round(Number(payment.amount) * 100);

  if (paymentIntent.amount !== expectedAmount) {
    throw new Error("Payment amount does not match order amount.");
  }

  // ==========================================
  // Mark Payment Paid
  // ==========================================

  if (payment.status !== "paid") {
    await updatePaymentRecord(payment.id, {
      status: "paid",
      paid_at: new Date().toISOString(),
      provider_response: paymentIntent,
    });

    console.log(`Payment ${payment.id} marked as paid.`);
  }

  // ==========================================
  // Fulfill Order
  // ==========================================

  await fulfillPaidOrder(payment.order_id, payment.id);

  console.log(`Order ${payment.order_id} fulfilled successfully.`);
};

// ============================================
// Stripe Payment Failed
// ============================================

const handleStripePaymentFailed = async (paymentIntent) => {
  const payment = await getPaymentByProviderPaymentId(
    "stripe",
    paymentIntent.id,
  );

  if (payment.status === "paid" || payment.status === "failed") {
    return;
  }

  await updatePaymentRecord(payment.id, {
    status: "failed",

    provider_response: paymentIntent,
  });

  console.log(`Payment ${payment.id} marked as failed.`);
};

// ============================================
// Exports
// ============================================

module.exports = {
  createPayment,
  createPaymentForOrder,
  handleStripeWebhook,
};
