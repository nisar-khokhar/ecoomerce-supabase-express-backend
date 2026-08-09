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

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
};
