const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const validate = require("../middlewares/validate");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");
const { idParamSchema } = require("../validators/common.validator");

// GET all categories
router.get("/", categoryController.getAllCategories);

// GET single category
router.get("/:id", validate(idParamSchema), categoryController.getCategoryById);

// CREATE category
router.post(
  "/",
  validate(createCategorySchema),
  categoryController.createCategory,
);

// UPDATE category
router.patch(
  "/:id",
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

// DELETE category
router.delete(
  "/:id",
  validate(idParamSchema),
  categoryController.deleteCategory,
);

module.exports = router;
