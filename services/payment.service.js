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
    throw new Error("Unable to update payment.");
  }

  return data;
};

// ============================================
// Create Payment
// ============================================

const createPayment = async ({
  orderId,
  orderNumber,
  amount,
  currency,
  customer,
}) => {
  const { name: providerName, provider } = getPaymentProvider();

  // Create our internal payment record first
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
      status: providerPayment.status || "pending",
      provider_response: providerPayment,
    });

    return {
      payment: updatedPayment,
      providerData: providerPayment,
    };
  } catch (error) {
    // Mark our payment as failed if provider initialization fails
    await updatePaymentRecord(payment.id, {
      status: "failed",
      provider_response: {
        error: error.message,
      },
    });

    throw error;
  }
};

module.exports = {
  createPayment,
};
