const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const paymentController = require("../controllers/payment.controller");

router.use(authenticate);

// Initialize payment for an existing order
router.post("/orders/:orderId", paymentController.createPayment);

module.exports = router;
