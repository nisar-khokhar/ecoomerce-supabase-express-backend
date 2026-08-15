/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const express = require("express");

const router = express.Router();

const brandController = require("../controllers/brand.controller");

const validate = require("../middlewares/validate");

const {
  createBrandSchema,
  updateBrandSchema,
} = require("../validators/brand.validator");
const { idParamSchema } = require("../validators/common.validator");

// GET all brands
router.get("/", brandController.getAllBrands);

// GET single brand
router.get("/:id", validate(idParamSchema), brandController.getBrandById);

// CREATE brand
router.post("/", validate(createBrandSchema), brandController.createBrand);

// UPDATE brand
router.patch("/:id", validate(updateBrandSchema), brandController.updateBrand);

// DELETE brand
router.delete("/:id", validate(idParamSchema), brandController.deleteBrand);

module.exports = router;
