const authService = require("../services/auth.service");
const asyncHandler = require("../middlewares/asyncHandler");

/**
 * Register User
 */
const registerUser = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: user,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: result,
  });
});

module.exports = {
  registerUser,
  loginUser,
};
