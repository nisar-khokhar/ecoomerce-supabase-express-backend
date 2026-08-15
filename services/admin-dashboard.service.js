/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");

// ============================================
// Admin Dashboard
// ============================================

const getDashboard = async () => {
  // ==========================================
  // Overview Counts
  // ==========================================

  const [ordersResult, customersResult, productsResult, variantsResult] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),

      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer"),

      supabase.from("products").select("id", { count: "exact", head: true }),

      supabase
        .from("product_variants")
        .select("id", { count: "exact", head: true }),
    ]);

  if (ordersResult.error) {
    throw new Error("Unable to fetch order statistics.");
  }

  if (customersResult.error) {
    throw new Error("Unable to fetch customer statistics.");
  }

  if (productsResult.error) {
    throw new Error("Unable to fetch product statistics.");
  }

  if (variantsResult.error) {
    throw new Error("Unable to fetch variant statistics.");
  }

  // ==========================================
  // Order Status Statistics
  // ==========================================

  const { data: orderStatuses, error: orderStatusError } = await supabase
    .from("orders")
    .select("status");

  if (orderStatusError) {
    throw new Error("Unable to fetch order status statistics.");
  }

  const orders = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orderStatuses) {
    if (orders[order.status] !== undefined) {
      orders[order.status]++;
    }
  }

  // ==========================================
  // Payment Statistics
  // ==========================================

  const { data: paymentStatuses, error: paymentError } = await supabase
    .from("payments")
    .select("status");

  if (paymentError) {
    throw new Error("Unable to fetch payment statistics.");
  }

  const payments = {
    paid: 0,
    failed: 0,
    refunded: 0,
    partially_refunded: 0,
  };

  for (const payment of paymentStatuses) {
    if (payments[payment.status] !== undefined) {
      payments[payment.status]++;
    }
  }

  // ==========================================
  // Gross Sales
  // ==========================================
  //
  // A payment can later become "refunded".
  // We still count the original successful
  // payment toward gross sales.
  //
  // Therefore we include:
  // - paid
  // - refunded
  // - partially_refunded
  // ==========================================

  const { data: successfulPayments, error: paymentSalesError } = await supabase
    .from("payments")
    .select("amount, status")
    .in("status", ["paid", "refunded", "partially_refunded"]);

  if (paymentSalesError) {
    throw new Error("Unable to calculate gross sales.");
  }

  const grossSales = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );
  // ==========================================
  // Refunded Amount
  // ==========================================

  const { data: successfulRefunds, error: refundError } = await supabase
    .from("refunds")
    .select("amount")
    .eq("status", "succeeded");

  if (refundError) {
    throw new Error("Unable to calculate refunded amount.");
  }

  const refundedAmount = successfulRefunds.reduce(
    (sum, refund) => sum + Number(refund.amount),
    0,
  );

  const netSales = grossSales - refundedAmount;

  // ==========================================
  // Inventory Statistics
  // ==========================================

  const { data: inventoryVariants, error: inventoryError } = await supabase
    .from("product_variants")
    .select("id, quantity")
    .eq("is_active", true);

  if (inventoryError) {
    throw new Error("Unable to fetch inventory statistics.");
  }

  const outOfStock = inventoryVariants.filter(
    (variant) => variant.quantity === 0,
  ).length;

  // ==========================================
  // Recent Orders
  // ==========================================

  const { data: recentOrders, error: recentOrdersError } = await supabase
    .from("orders")
    .select(
      `
          id,
          order_number,
          user_id,
          status,
          payment_status,
          total_amount,
          created_at
        `,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (recentOrdersError) {
    throw new Error("Unable to fetch recent orders.");
  }

  // ==========================================
  // Return Dashboard
  // ==========================================

  return {
    overview: {
      total_orders: ordersResult.count || 0,
      total_customers: customersResult.count || 0,
      total_products: productsResult.count || 0,
      total_variants: variantsResult.count || 0,
    },

    sales: {
      gross_sales: grossSales,
      refunded_amount: refundedAmount,
      net_sales: netSales,
    },

    orders,

    payments,

    inventory: {
      total_variants: variantsResult.count || 0,
      out_of_stock: outOfStock,
    },

    recent_orders: recentOrders,
  };
};

module.exports = {
  getDashboard,
};
