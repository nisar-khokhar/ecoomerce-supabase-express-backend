const express = require("express");

const router = express.Router();

const bodyParser = require("body-parser");

const { stripeWebhook } = require("../controllers/paymentWebhook.controller");

router.post(
  "/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook,
);

module.exports = router;
