const express = require("express");

const router = express.Router();

const productController = require("../controllers/product.controller");

const validate = require("../middlewares/validate");

const { idParamSchema } = require("../validators/common.validator");

const {
  createProductSchema,
  updateProductSchema,
  getProductsSchema,
} = require("../validators/product.validator");

// ==============================
// GET Routes
// ==============================

// Get all products
// Supports:
// ?page=1
// ?limit=10
// ?search=iphone
// ?category=1
// ?brand=2
// ?featured=true
// ?active=true
// ?sort=price
// ?order=asc

router.get("/", validate(getProductsSchema), productController.getAllProducts);

// Get single product

router.get("/:id", validate(idParamSchema), productController.getProductById);

// ==============================
// POST Routes
// ==============================

router.post(
  "/",
  validate(createProductSchema),
  productController.createProduct,
);

// ==============================
// PATCH Routes
// ==============================

router.patch(
  "/:id",
  validate(updateProductSchema),
  productController.updateProduct,
);

// ==============================
// DELETE Routes
// ==============================

router.delete("/:id", validate(idParamSchema), productController.deleteProduct);

module.exports = router;
