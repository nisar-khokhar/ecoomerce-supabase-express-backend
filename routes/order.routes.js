const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");

const {
  createOrderSchema,
  orderIdParamSchema,
  getOrdersSchema,
} = require("../validators/order.validator");

const orderController = require("../controllers/order.controller");

router.use(authenticate);

router.post("/", validate(createOrderSchema), orderController.createOrder);

router.get("/", validate(getOrdersSchema), orderController.getUserOrders);

router.get("/:id", validate(orderIdParamSchema), orderController.getOrderById);

module.exports = router;
