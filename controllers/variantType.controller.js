/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const variantTypeService = require("../services/variantType.service");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Get all variant types
 */
const getAllVariantTypes = asyncHandler(async (req, res) => {
  const variantTypes = await variantTypeService.getAllVariantTypes();

  return res.status(200).json({
    success: true,
    message: "Variant types fetched successfully.",
    data: variantTypes,
  });
});

/**
 * Get variant type by ID
 */
const getVariantType = asyncHandler(async (req, res) => {
  const variantType = await variantTypeService.getVariantType(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Variant type fetched successfully.",
    data: variantType,
  });
});

/**
 * Create variant type
 */
const createVariantType = asyncHandler(async (req, res) => {
  const variantType = await variantTypeService.createVariantType(req.body);

  return res.status(201).json({
    success: true,
    message: "Variant type created successfully.",
    data: variantType,
  });
});

/**
 * Update variant type
 */
const updateVariantType = asyncHandler(async (req, res) => {
  const variantType = await variantTypeService.updateVariantType(
    req.params.id,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Variant type updated successfully.",
    data: variantType,
  });
});

/**
 * Delete variant type
 */
const deleteVariantType = asyncHandler(async (req, res) => {
  await variantTypeService.deleteVariantType(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Variant type deleted successfully.",
  });
});

module.exports = {
  getAllVariantTypes,
  getVariantType,
  createVariantType,
  updateVariantType,
  deleteVariantType,
};
