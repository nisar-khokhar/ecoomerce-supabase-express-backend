/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const asyncHandler = require("../middlewares/asyncHandler");
const orderService = require("../services/order.service");

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);

  return res.status(201).json({
    success: true,
    message: "Order created successfully.",
    data: order,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.params.id);

  return res.status(200).json({
    success: true,
    message: "Order fetched successfully.",
    data: order,
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user.id, req.query);

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully.",
    data: result,
  });
});

// ============================================
// Cancel Order
// ============================================

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.params.id);

  let result;

  if (["paid", "partially_refunded"].includes(order.payment_status)) {
    result = await orderService.cancelPaidOrder(req.user.id, req.params.id);

    return res.status(201).json({
      success: true,
      message: "Order cancellation and refund initiated.",
      data: result,
    });
  }

  result = await orderService.cancelOrder(req.user.id, req.params.id);

  return res.status(200).json({
    success: true,
    message: "Order cancelled successfully.",
    data: result,
  });
});

// ============================================
// Admin - Get All Orders
// ============================================

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully.",
    data: result,
  });
});

// ============================================
// Admin - Get Order
// ============================================

const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getAdminOrderById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Order fetched successfully.",
    data: order,
  });
});

// ============================================
// Admin - Update Order Status
// ============================================

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status,
  );

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully.",
    data: order,
  });
});

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,

  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
};
