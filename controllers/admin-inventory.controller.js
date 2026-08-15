/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const asyncHandler = require("../middlewares/asyncHandler");

const adminInventoryService = require("../services/admin-inventory.service");

// ============================================
// Get Inventory
// ============================================

const getInventory = asyncHandler(async (req, res) => {
  const result = await adminInventoryService.getInventory(req.query);

  return res.status(200).json({
    success: true,
    message: "Inventory fetched successfully.",
    data: result,
  });
});

// ============================================
// Get Inventory Variant
// ============================================

const getInventoryVariant = asyncHandler(async (req, res) => {
  const variant = await adminInventoryService.getInventoryVariant(
    req.params.id,
  );

  return res.status(200).json({
    success: true,
    message: "Inventory variant fetched successfully.",
    data: variant,
  });
});

// ============================================
// Update Inventory Variant
// ============================================

const updateInventoryVariant = asyncHandler(async (req, res) => {
  const movement = await adminInventoryService.updateInventoryVariant({
    variantId: req.params.id,

    quantity: req.body.quantity,

    type: req.body.type,

    reason: req.body.reason,

    adminUserId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "Inventory updated successfully.",
    data: movement,
  });
});

// ============================================
// Get Inventory Movements
// ============================================

const getInventoryMovements = asyncHandler(async (req, res) => {
  const result = await adminInventoryService.getInventoryMovements({
    variantId: req.params.id,
    ...req.query,
  });

  return res.status(200).json({
    success: true,
    message: "Inventory movements fetched successfully.",
    data: result,
  });
});

module.exports = {
  getInventory,
  getInventoryVariant,
  updateInventoryVariant,
  getInventoryMovements,
};
