/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const userService = require("../services/user.service");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Get Logged-in User Profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully.",
    data: profile,
  });
});

/**
 * Update Logged-in User Profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user.id, req.body);

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: profile,
  });
});

/**
 * Change Password
 */
const changePassword = asyncHandler(async (req, res) => {
  console.log(req.body);
  await userService.changePassword(req.user.id, req.body);

  return res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
