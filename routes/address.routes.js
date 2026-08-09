const express = require("express");

const router = express.Router();

const addressController = require("../controllers/address.controller");

const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");

const {
  createAddressSchema,
  updateAddressSchema,
} = require("../validators/address.validator");
const { idParamSchema } = require("../validators/common.validator");

// All address routes require authentication
router.use(authenticate);

// Get all addresses
router.get("/", addressController.getAddresses);

// Get single address
router.get("/:id", validate(idParamSchema), addressController.getAddress);

// Create address
router.post(
  "/",
  validate(createAddressSchema),
  addressController.createAddress,
);

// Update address
router.patch(
  "/:id",
  validate(updateAddressSchema),
  addressController.updateAddress,
);

// Delete address
router.delete("/:id", validate(idParamSchema), addressController.deleteAddress);

// Set default address
router.patch(
  "/:id/default",
  validate(idParamSchema),
  addressController.setDefaultAddress,
);

module.exports = router;
