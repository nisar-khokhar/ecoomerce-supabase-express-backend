/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");

const {
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/user.validator");

/**
 * Profile
 */
router.get("/profile", authenticate, userController.getProfile);

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);

router.put(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);

module.exports = router;
