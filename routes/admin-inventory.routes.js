const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");

const authorize = require("../middlewares/authorize");

const validate = require("../middlewares/validate");

const {
  getInventorySchema,
  updateInventorySchema,
  inventoryVariantIdSchema,
  getInventoryMovementsSchema,
} = require("../validators/admin-inventory.validator");

const {
  getInventory,
  getInventoryVariant,
  updateInventoryVariant,
  getInventoryMovements,
} = require("../controllers/admin-inventory.controller");

// ============================================
// Admin Authentication
// ============================================

router.use(authenticate);

router.use(authorize("admin"));

// ============================================
// Get Inventory
// ============================================

router.get("/", validate(getInventorySchema), getInventory);

router.get(
  "/:id/movements",
  validate(getInventoryMovementsSchema),
  getInventoryMovements,
);

// ============================================
// Get Inventory Variant
// ============================================

router.get("/:id", validate(inventoryVariantIdSchema), getInventoryVariant);

// ============================================
// Update Inventory Variant
// ============================================

router.patch("/:id", validate(updateInventorySchema), updateInventoryVariant);

module.exports = router;
