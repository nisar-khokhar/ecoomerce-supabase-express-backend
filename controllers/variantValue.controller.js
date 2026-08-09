const variantValueService = require("../services/variantValue.service");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Get all variant values
 */
const getAllVariantValues = asyncHandler(async (req, res) => {
  const variantValues = await variantValueService.getAllVariantValues();

  return res.status(200).json({
    success: true,
    message: "Variant values fetched successfully.",
    data: variantValues,
  });
});

/**
 * Get variant value by ID
 */
const getVariantValue = asyncHandler(async (req, res) => {
  const variantValue = await variantValueService.getVariantValue(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Variant value fetched successfully.",
    data: variantValue,
  });
});

/**
 * Create variant value
 */
const createVariantValue = asyncHandler(async (req, res) => {
  const variantValue = await variantValueService.createVariantValue(req.body);

  return res.status(201).json({
    success: true,
    message: "Variant value created successfully.",
    data: variantValue,
  });
});

/**
 * Update variant value
 */
const updateVariantValue = asyncHandler(async (req, res) => {
  const variantValue = await variantValueService.updateVariantValue(
    req.params.id,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Variant value updated successfully.",
    data: variantValue,
  });
});

/**
 * Delete variant value
 */
const deleteVariantValue = asyncHandler(async (req, res) => {
  await variantValueService.deleteVariantValue(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Variant value deleted successfully.",
  });
});

module.exports = {
  getAllVariantValues,
  getVariantValue,
  createVariantValue,
  updateVariantValue,
  deleteVariantValue,
};
