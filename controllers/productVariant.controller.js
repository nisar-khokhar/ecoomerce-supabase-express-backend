/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const productVariantService = require("../services/productVariant.service");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Get all product variants
 */
const getAllProductVariants = asyncHandler(async (req, res) => {
  const variants = await productVariantService.getAllProductVariants();

  return res.status(200).json({
    success: true,
    message: "Product variants fetched successfully.",
    data: variants,
  });
});

/**
 * Get product variant by ID
 */
const getProductVariant = asyncHandler(async (req, res) => {
  const variant = await productVariantService.getProductVariant(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Product variant fetched successfully.",
    data: variant,
  });
});

/**
 * Create product variant
 */
const createProductVariant = asyncHandler(async (req, res) => {
  const variant = await productVariantService.createProductVariant(req.body);

  return res.status(201).json({
    success: true,
    message: "Product variant created successfully.",
    data: variant,
  });
});

/**
 * Update product variant
 */
const updateProductVariant = asyncHandler(async (req, res) => {
  const variant = await productVariantService.updateProductVariant(
    req.params.id,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Product variant updated successfully.",
    data: variant,
  });
});

/**
 * Delete product variant
 */
const deleteProductVariant = asyncHandler(async (req, res) => {
  await productVariantService.deleteProductVariant(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Product variant deleted successfully.",
  });
});

module.exports = {
  getAllProductVariants,
  getProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
