const createPayment = async ({
  paymentId,
  orderId,
  orderNumber,
  amount,
  currency,
  customer,
}) => {
  /*
   * XPay-specific implementation will go here.
   *
   * Responsibilities:
   * 1. Create XPay Checkout Session
   * 2. Pass our internal order/payment reference
   * 3. Receive XPay checkout URL
   * 4. Return normalized payment data
   */

  throw new Error("XPay payment provider is not implemented yet.");
};

const verifyWebhook = async (payload, signature) => {
  /*
   * Verify XPay webhook signature.
   *
   * Never trust payment status directly
   * from the frontend.
   */

  throw new Error("XPay webhook verification is not implemented yet.");
};

const getPaymentStatus = async (providerPaymentId) => {
  /*
   * Optional server-side payment status lookup.
   */

  throw new Error("XPay payment status lookup is not implemented yet.");
};

module.exports = {
  createPayment,
  verifyWebhook,
  getPaymentStatus,
};
