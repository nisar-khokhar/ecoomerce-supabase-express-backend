/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
  createOrderSchema,
  orderIdParamSchema,
  getOrdersSchema,
  updateOrderStatusSchema,
  getAdminOrdersSchema,
} = require("../validators/order.validator");

const orderController = require("../controllers/order.controller");

router.use(authenticate);

// ============================================
// Admin Routes
// ============================================

router.get(
  "/admin/all",
  authorize("admin"),
  validate(getAdminOrdersSchema),
  orderController.getAllOrders,
);
router.get(
  "/admin/:id",
  authorize("admin"),
  validate(orderIdParamSchema),
  orderController.getAdminOrderById,
);

router.patch(
  "/admin/:id/status",
  authorize("admin"),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

// ============================================
// Customer Routes
// ============================================

router.post("/", validate(createOrderSchema), orderController.createOrder);

router.get("/", validate(getOrdersSchema), orderController.getUserOrders);

router.post(
  "/:id/cancel",
  validate(orderIdParamSchema),
  orderController.cancelOrder,
);

router.get("/:id", validate(orderIdParamSchema), orderController.getOrderById);

module.exports = router;
