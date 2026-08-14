/*

* Author: Malik Nisar Jamil
* Email: khokharmaliknisar@gmail.com


_________________________________________________________________
* Date: Fri Aug 07 2026
            
*/

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

/**
 * Set the "dev" script in package.json to get data from .env.local file
 * and install dotenv package to use this feature.
 * This will help to set the PORT variable in .env.local file
 * and use it in the app.js file.
 *
 */
require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? ".env.local" : ".env",
});

var indexRouter = require("./routes/index");
const categoryRoutes = require("./routes/category.routes");
const brandRoutes = require("./routes/brand.routes");
const productRoutes = require("./routes/product.routes");
const authRouter = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const addressRoutes = require("./routes/address.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const variantTypeRoutes = require("./routes/variantType.routes");
const variantValueRoutes = require("./routes/variantValue.routes");
const productVariantRoutes = require("./routes/productVariant.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const refundRoutes = require("./routes/refund.routes");
const reviewRoutes = require("./routes/review.routes");
const adminReviewRoutes = require("./routes/admin-review.routes");
const adminInventoryRoutes = require("./routes/admin-inventory.routes");
const adminDashboardRoutes = require("./routes/admin-dashboard.routes");
const adminSalesAnalyticsRoutes = require("./routes/admin-sales-analytics.routes");
const couponRoutes = require("./routes/coupon.routes");
const adminReportsRoutes = require("./routes/admin-reports.routes");

const paymentWebhookRoutes = require("./routes/paymentWebhook.routes");

var app = express();
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || false,
    credentials: true,
  }),
);

app.use("/api/payments/webhook", paymentWebhookRoutes);

/**
 * morgan logger logs the request type, path, status code, response time, and other details to the console for debugging and monitoring purposes.
 *
 */
app.use(logger("dev"));

/**
 * This middleware parses incoming JSON request bodies.
 *
 */
app.use(express.json({ limit: "1mb" }));

/**
 * This parses data submitted from HTML forms.
 *
 */
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

/**
 * parses cookies attached to the client request object and makes them available under req.cookies.
 *
 */
app.use(cookieParser());

/**
 * If a request matches a file inside the public folder, return that file directly instead of executing any route.
 *
 */
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/variant-types", variantTypeRoutes);
app.use("/api/variant-values", variantValueRoutes);
app.use("/api/product-variants", productVariantRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/analytics", adminSalesAnalyticsRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/admin/reports", adminReportsRoutes);

// ============================================
// 404 Handler
// ============================================

app.use((req, res, next) => {
  const error = new Error("Route not found.");
  error.status = 404;

  next(error);
});

// ============================================
// Global Error Handler
// ============================================

app.use(errorHandler);

module.exports = app;
//cross-env NODE_ENV=development
