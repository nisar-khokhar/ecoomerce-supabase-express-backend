const errorHandler = (err, req, res, next) => {
  // ============================================
  // Server-side logging
  // ============================================

  console.error("ERROR:", {
    message: err.message,
    status: err.status,
    method: req.method,
    path: req.originalUrl,
    stack: err.stack,
  });

  // ============================================
  // Determine status
  // ============================================

  const statusCode = err.status || 500;

  // ============================================
  // Production-safe message
  // ============================================

  const isProduction = process.env.NODE_ENV === "production";

  let message = err.message || "Internal Server Error.";

  if (isProduction && statusCode >= 500) {
    message = "Internal server error.";
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
