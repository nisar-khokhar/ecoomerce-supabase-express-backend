const express = require("express");

const router = express.Router();

const wishlistController = require("../controllers/wishlist.controller");

const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");

const {
  createWishlistSchema,
  productIdParamSchema,
} = require("../validators/wishlist.validator");

// All wishlist routes require authentication
router.use(authenticate);

/**
 * Get Wishlist
 */
router.get("/", wishlistController.getWishlist);

/**
 * Add Product
 */
router.post(
  "/",
  validate(createWishlistSchema),
  wishlistController.addToWishlist,
);

/**
 * Remove Product
 */
router.delete(
  "/:productId",
  validate(productIdParamSchema),
  wishlistController.removeFromWishlist,
);

module.exports = router;
