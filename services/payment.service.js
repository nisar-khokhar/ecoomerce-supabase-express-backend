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
// Refund Order
// ============================================

const refundOrder = async ({
  orderId,
  amount,
  reason,
  cancellation = false,
}) => {
  // ==========================================
  // Get Order
  // ==========================================

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      user_id,
      status,
      payment_status,
      total_amount
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error("Unable to fetch order.");
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  // ==========================================
  // Order Must Be Paid
  // ==========================================

  if (order.payment_status !== "paid") {
    throw new Error("Only paid orders can be refunded.");
  }

  // ==========================================
  // Get Payment
  // ==========================================

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(
      `
      id,
      order_id,
      provider,
      provider_payment_id,
      amount,
      currency,
      status
    `,
    )
    .eq("order_id", order.id)
    .in("status", ["paid", "partially_refunded"])
    .maybeSingle();

  if (paymentError) {
    throw new Error("Unable to fetch payment.");
  }

  if (!payment) {
    throw new Error("Paid payment not found.");
  }

  if (!payment.provider_payment_id) {
    throw new Error("Payment provider transaction ID is missing.");
  }

  // ==========================================
  // Get Payment Provider
  // ==========================================

  const { name: providerName, provider } = getPaymentProvider();

  if (payment.provider !== providerName) {
    throw new Error("Payment provider mismatch.");
  }

  // ==========================================
  // Calculate Already Refunded Amount
  // ==========================================

  const alreadyRefunded = await getRefundedAmount(payment.id);

  const paymentAmount = Number(payment.amount);

  const remainingRefundable = paymentAmount - alreadyRefunded;

  // ==========================================
  // Determine Refund Amount
  // ==========================================

  const refundAmount =
    amount !== undefined ? Number(amount) : remainingRefundable;

  // ==========================================
  // Validate Refund Amount
  // ==========================================

  if (refundAmount <= 0) {
    throw new Error("No refundable amount remains.");
  }

  if (refundAmount > remainingRefundable) {
    throw new Error(
      `Refund amount exceeds the remaining refundable amount of ${remainingRefundable}.`,
    );
  }

  // ==========================================
  // Create Internal Refund Record
  // ==========================================

  const { data: refund, error: refundError } = await supabase
    .from("refunds")
    .insert({
      payment_id: payment.id,
      order_id: order.id,
      provider: providerName,
      amount: refundAmount,
      currency: payment.currency,
      status: "pending",
      reason: reason || null,
      cancellation_requested: cancellation,
    })
    .select()
    .single();

  if (refundError) {
    throw new Error("Unable to create refund record.");
  }

  try {
    // ========================================
    // Create Provider Refund
    // ========================================

    const providerRefund = await provider.createRefund({
      providerPaymentId: payment.provider_payment_id,

      amount: refundAmount,
    });

    // ========================================
    // Update Refund Record
    // ========================================

    const { data: updatedRefund, error: updateError } = await supabase
      .from("refunds")
      .update({
        provider_refund_id: providerRefund.providerRefundId,

        status: "pending",

        provider_response: providerRefund,

        updated_at: new Date().toISOString(),
      })
      .eq("id", refund.id)
      .select()
      .single();

    if (updateError) {
      throw new Error("Unable to update refund record.");
    }

    return updatedRefund;
  } catch (error) {
    await supabase
      .from("refunds")
      .update({
        status: "failed",
        provider_response: {
          error: error.message,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", refund.id);

    throw error;
  }
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

    case "charge.refunded":
      await handleStripeRefunded(stripeEvent.data.object);
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
// Stripe Refund Completed
// ============================================

const handleStripeRefunded = async (charge) => {
  console.log("============================================");
  console.log("STRIPE REFUND WEBHOOK RECEIVED");
  console.log("Charge ID:", charge.id);
  console.log("Payment Intent:", charge.payment_intent);
  console.log("============================================");

  const providerPaymentId = charge.payment_intent;

  if (!providerPaymentId) {
    console.log("Refund event does not contain a payment intent.");

    return;
  }

  // ==========================================
  // Find Internal Payment
  // ==========================================

  const payment = await getPaymentByProviderPaymentId(
    "stripe",
    providerPaymentId,
  );

  // ==========================================
  // Retrieve Charge With Refunds
  // ==========================================

  const stripeCharge = await stripeProvider.getChargeWithRefunds(charge.id);

  const stripeRefund = stripeCharge.refunds?.data?.[0];

  const providerRefundId = stripeRefund?.id;

  if (!providerRefundId) {
    console.log("Unable to determine Stripe refund ID.");

    return;
  }

  console.log(`Stripe refund detected: ${providerRefundId}`);

  // ==========================================
  // Find Internal Refund
  // ==========================================

  const { data: refund, error: refundError } = await supabase
    .from("refunds")
    .select("*")
    .eq("payment_id", payment.id)
    .eq("provider", "stripe")
    .eq("provider_refund_id", providerRefundId)
    .maybeSingle();

  if (refundError) {
    throw new Error("Unable to fetch refund.");
  }

  if (!refund) {
    console.log(
      `Refund ${providerRefundId} not found for payment ${payment.id}.`,
    );

    return;
  }

  // ==========================================
  // Mark Refund Successful
  // ==========================================

  if (refund.status !== "succeeded") {
    const { error: updateRefundError } = await supabase
      .from("refunds")
      .update({
        status: "succeeded",
        provider_response: charge,
        updated_at: new Date().toISOString(),
      })
      .eq("id", refund.id);

    if (updateRefundError) {
      throw new Error("Unable to update refund record.");
    }
  }

  // ==========================================
  // Calculate Total Refunded
  // ==========================================

  const totalRefunded = await getRefundedAmount(payment.id);

  const paymentAmount = Number(payment.amount);

  // ==========================================
  // Determine Payment Status
  // ==========================================

  const paymentStatus =
    totalRefunded >= paymentAmount ? "refunded" : "partially_refunded";

  // ==========================================
  // Update Payment
  // ==========================================

  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status: paymentStatus,
      provider_response: charge,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (paymentUpdateError) {
    throw new Error("Unable to update payment status.");
  }

  // ==========================================
  // Update Order
  // ==========================================

  const orderUpdate = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };

  // ==========================================
  // Cancellation Refund
  // ==========================================

  if (paymentStatus === "refunded" && refund.cancellation_requested) {
    orderUpdate.status = "cancelled";
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update(orderUpdate)
    .eq("id", payment.order_id);

  if (orderError) {
    throw new Error("Unable to update order refund status.");
  }

  // ==========================================
  // Restore Inventory For Cancellation
  // ==========================================

  if (paymentStatus === "refunded" && refund.cancellation_requested) {
    const { error: inventoryError } = await supabase.rpc(
      "restore_cancelled_order_inventory",
      {
        p_order_id: payment.order_id,
      },
    );

    if (inventoryError) {
      throw new Error(
        `Unable to restore cancelled order inventory: ${inventoryError.message}`,
      );
    }

    console.log(`Inventory restored for cancelled order ${payment.order_id}.`);
  }

  console.log(
    `Refund ${refund.id} processed. ` +
      `Payment ${payment.id} is now ${paymentStatus}. ` +
      `Total refunded: ${totalRefunded}.`,
  );
};

// ============================================
// Get Total Refunded Amount
// ============================================

const getRefundedAmount = async (paymentId) => {
  const { data, error } = await supabase
    .from("refunds")
    .select("amount")
    .eq("payment_id", paymentId)
    .eq("status", "succeeded");

  if (error) {
    throw new Error("Unable to calculate refunded amount.");
  }

  return (data || []).reduce(
    (total, refund) => total + Number(refund.amount),
    0,
  );
};

// ============================================
// Exports
// ============================================

module.exports = {
  createPayment,
  createPaymentForOrder,
  refundOrder,

  handleStripeWebhook,
};
