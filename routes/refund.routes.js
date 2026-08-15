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

const { refundOrderSchema } = require("../validators/refund.validator");

const refundController = require("../controllers/refund.controller");

router.use(authenticate);

// ============================================
// Admin Refund
// ============================================

router.post(
  "/orders/:id/refund",
  authorize("admin"),
  validate(refundOrderSchema),
  refundController.refundOrder,
);

module.exports = router;
