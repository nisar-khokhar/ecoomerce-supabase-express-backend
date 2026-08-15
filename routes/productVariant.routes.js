/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const express = require("express");

const router = express.Router();

const productVariantController = require("../controllers/productVariant.controller");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
  createProductVariantSchema,
  updateProductVariantSchema,
  productVariantIdParamSchema,
} = require("../validators/productVariant.validator");

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", productVariantController.getAllProductVariants);

router.get(
  "/:id",
  validate(productVariantIdParamSchema),
  productVariantController.getProductVariant,
);

router.post(
  "/",
  validate(createProductVariantSchema),
  productVariantController.createProductVariant,
);

router.patch(
  "/:id",
  validate(updateProductVariantSchema),
  productVariantController.updateProductVariant,
);

router.delete(
  "/:id",
  validate(productVariantIdParamSchema),
  productVariantController.deleteProductVariant,
);

module.exports = router;
