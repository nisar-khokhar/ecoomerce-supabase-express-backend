const express = require("express");

const router = express.Router();

const variantValueController = require("../controllers/variantValue.controller");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");

const {
  createVariantValueSchema,
  updateVariantValueSchema,
  variantValueIdParamSchema,
} = require("../validators/variantValue.validator");

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", variantValueController.getAllVariantValues);

router.get(
  "/:id",
  validate(variantValueIdParamSchema),
  variantValueController.getVariantValue,
);

router.post(
  "/",
  validate(createVariantValueSchema),
  variantValueController.createVariantValue,
);

router.patch(
  "/:id",
  validate(updateVariantValueSchema),
  variantValueController.updateVariantValue,
);

router.delete(
  "/:id",
  validate(variantValueIdParamSchema),
  variantValueController.deleteVariantValue,
);

module.exports = router;
