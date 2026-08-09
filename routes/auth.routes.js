const express = require("express");

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");

const { registerSchema, loginSchema } = require("../validators/auth.validator");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

/**
 * Register
 */
router.post("/register", validate(registerSchema), authController.registerUser);

/**
 * Login
 */
router.post("/login", validate(loginSchema), authController.loginUser);

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

module.exports = router;
