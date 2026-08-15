/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const asyncHandler = require("../middlewares/asyncHandler");
const paymentService = require("../services/payment.service");

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPaymentForOrder({
    userId: req.user.id,
    orderId: req.params.orderId,
    customer: {
      email: req.user.email,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Payment initialized successfully.",
    data: payment,
  });
});

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

module.exports = {
  createPayment,
  createPaymentForOrder,
};
