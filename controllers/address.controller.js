const addressService = require("../services/address.service");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Get All Addresses
 */
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Addresses fetched successfully.",
    data: addresses,
  });
});

/**
 * Get Single Address
 */
const getAddress = asyncHandler(async (req, res) => {
  const address = await addressService.getAddress(req.user.id, req.params.id);

  return res.status(200).json({
    success: true,
    message: "Address fetched successfully.",
    data: address,
  });
});

/**
 * Create Address
 */
const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createUserAddress(req.user.id, req.body);

  return res.status(201).json({
    success: true,
    message: "Address created successfully.",
    data: address,
  });
});

/**
 * Update Address
 */
const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateUserAddress(
    req.user.id,
    req.params.id,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Address updated successfully.",
    data: address,
  });
});

/**
 * Delete Address
 */
const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteUserAddress(req.user.id, req.params.id);

  return res.status(200).json({
    success: true,
    message: "Address deleted successfully.",
  });
});

/**
 * Set Default Address
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(
    req.user.id,
    req.params.id,
  );

  return res.status(200).json({
    success: true,
    message: "Default address updated successfully.",
    data: address,
  });
});

module.exports = {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
