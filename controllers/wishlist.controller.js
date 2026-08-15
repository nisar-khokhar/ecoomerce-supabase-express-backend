/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const wishlistService = require("../services/wishlist.service");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Get Wishlist
 */
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Wishlist fetched successfully.",
    data: wishlist,
  });
});

/**
 * Add Product to Wishlist
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const wishlistItem = await wishlistService.addToWishlist(
    req.user.id,
    req.body.product_id,
  );

  return res.status(201).json({
    success: true,
    message: "Product added to wishlist successfully.",
    data: wishlistItem,
  });
});

/**
 * Remove Product from Wishlist
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  await wishlistService.removeFromWishlist(req.user.id, req.params.productId);

  return res.status(200).json({
    success: true,
    message: "Product removed from wishlist successfully.",
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
