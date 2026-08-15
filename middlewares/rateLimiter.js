/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const rateLimit = require("express-rate-limit");

// ============================================
// Global API Limiter
// ============================================

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// ============================================
// Authentication Limiter
// ============================================

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// ============================================
// Payment Limiter
// ============================================

const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many payment requests. Please try again later.",
  },
});

// ============================================
// Coupon Limiter
// ============================================

const couponRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 30,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many coupon requests. Please try again later.",
  },
});

module.exports = {
  globalRateLimiter,
  authRateLimiter,
  paymentRateLimiter,
  couponRateLimiter,
};
