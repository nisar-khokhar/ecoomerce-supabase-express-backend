const express = require("express");

const router = express.Router();

const variantTypeController = require("../controllers/variantType.controller");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
  createVariantTypeSchema,
  updateVariantTypeSchema,
  variantTypeIdParamSchema,
} = require("../validators/variantType.validator");

// Only authenticated admins can manage variant types
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", variantTypeController.getAllVariantTypes);

router.get(
  "/:id",
  validate(variantTypeIdParamSchema),
  variantTypeController.getVariantType,
);

router.post(
  "/",
  validate(createVariantTypeSchema),
  variantTypeController.createVariantType,
);

router.patch(
  "/:id",
  validate(updateVariantTypeSchema),
  variantTypeController.updateVariantType,
);

router.delete(
  "/:id",
  validate(variantTypeIdParamSchema),
  variantTypeController.deleteVariantType,
);

module.exports = router;
