const express = require("express");

const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");

const cartController = require("../controllers/cart.controller");

const {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemVariantIdParamSchema,
} = require("../validators/cart.validator");

// ============================================
// Authentication
// ============================================

router.use(authenticate);

// ============================================
// Cart
// ============================================

router.get("/", cartController.getCart);

router.post("/items", validate(addCartItemSchema), cartController.addCartItem);

router.patch(
  "/items/:variantId",
  validate(updateCartItemSchema),
  cartController.updateCartItem,
);

router.delete(
  "/items/:variantId",
  validate(cartItemVariantIdParamSchema),
  cartController.removeCartItem,
);

router.delete("/", cartController.clearCart);

module.exports = router;
