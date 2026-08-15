/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const asyncHandler = require("../middlewares/asyncHandler");
const cartService = require("../services/cart.service");

// ============================================
// Get Cart
// ============================================

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getOrCreateCart(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Cart fetched successfully.",
    data: cart,
  });
});

// ============================================
// Add Item To Cart
// ============================================

const addCartItem = asyncHandler(async (req, res) => {
  const { product_variant_id, quantity } = req.body;

  const cart = await cartService.addCartItem(
    req.user.id,
    product_variant_id,
    quantity,
  );

  return res.status(200).json({
    success: true,
    message: "Item added to cart successfully.",
    data: cart,
  });
});

// ============================================
// Update Cart Item
// ============================================

const updateCartItem = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity } = req.body;

  const cart = await cartService.updateCartItem(
    req.user.id,
    variantId,
    quantity,
  );

  return res.status(200).json({
    success: true,
    message: "Cart item updated successfully.",
    data: cart,
  });
});

// ============================================
// Remove Cart Item
// ============================================

const removeCartItem = asyncHandler(async (req, res) => {
  const { variantId } = req.params;

  const cart = await cartService.removeCartItem(req.user.id, variantId);

  return res.status(200).json({
    success: true,
    message: "Item removed from cart successfully.",
    data: cart,
  });
});

// ============================================
// Clear Cart
// ============================================

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Cart cleared successfully.",
    data: cart,
  });
});

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
