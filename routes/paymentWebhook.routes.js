/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

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
