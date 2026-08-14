const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const paymentController = require("../controllers/payment.controller");
const { paymentRateLimiter } = require("../middlewares/rateLimiter");

router.use(authenticate);

// Initialize payment for an existing order
router.post(
  "/orders/:orderId",
  paymentRateLimiter,
  paymentController.createPayment,
);

module.exports = router;
