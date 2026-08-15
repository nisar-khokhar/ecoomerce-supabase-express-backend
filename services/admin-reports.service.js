/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");

// ============================================
// Build Date Range
// ============================================

const buildDateRange = ({ from, to }) => {
  return {
    fromDate: from ? `${from}T00:00:00.000Z` : null,

    // Exclusive upper bound.
    // Example:
    // to = 2026-08-31
    // becomes 2026-09-01T00:00:00.000Z
    toDate: to
      ? new Date(`${to}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000
      : null,
  };
};

// ============================================
// Apply Date Filter
// ============================================

const applyDateFilter = (query, { fromDate, toDate }) => {
  if (fromDate) {
    query = query.gte("created_at", fromDate);
  }

  if (toDate) {
    query = query.lt("created_at", new Date(toDate).toISOString());
  }

  return query;
};

// ============================================
// Sales Report
// ============================================

const getSalesReport = async ({ from, to }) => {
  const dateRange = buildDateRange({ from, to });

  // ==========================================
  // Successful Payments
  // ==========================================

  let paymentsQuery = supabase
    .from("payments")
    .select("amount, status, created_at")
    .in("status", ["paid", "refunded", "partially_refunded"]);

  paymentsQuery = applyDateFilter(paymentsQuery, dateRange);

  const { data: successfulPayments, error: paymentError } = await paymentsQuery;

  if (paymentError) {
    console.error("ADMIN SALES REPORT PAYMENT ERROR:", paymentError);
    throw new Error("Unable to calculate sales report.");
  }

  // ==========================================
  // Gross Sales
  // ==========================================

  const grossSales = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  // ==========================================
  // Successful Refunds
  // ==========================================

  let refundsQuery = supabase
    .from("refunds")
    .select("amount, created_at")
    .eq("status", "succeeded");

  refundsQuery = applyDateFilter(refundsQuery, dateRange);

  const { data: successfulRefunds, error: refundError } = await refundsQuery;

  if (refundError) {
    console.error("ADMIN SALES REPORT REFUND ERROR:", refundError);
    throw new Error("Unable to calculate refunded amount.");
  }

  const refundedAmount = successfulRefunds.reduce(
    (sum, refund) => sum + Number(refund.amount),
    0,
  );

  const netSales = grossSales - refundedAmount;

  // ==========================================
  // Successful Orders
  // ==========================================

  let ordersQuery = supabase
    .from("orders")
    .select("id, payment_status, total_amount, created_at")
    .in("payment_status", ["paid", "refunded", "partially_refunded"]);

  ordersQuery = applyDateFilter(ordersQuery, dateRange);

  const { data: successfulOrders, error: ordersError } = await ordersQuery;

  if (ordersError) {
    console.error("ADMIN SALES REPORT ORDERS ERROR:", ordersError);
    throw new Error("Unable to calculate order report.");
  }

  const paidOrders = successfulOrders.length;

  const averageOrderValue =
    paidOrders > 0 ? Number((grossSales / paidOrders).toFixed(2)) : 0;

  // ==========================================
  // Sales By Day
  // ==========================================

  const salesByDayMap = {};

  for (const payment of successfulPayments) {
    const date = payment.created_at.split("T")[0];

    if (!salesByDayMap[date]) {
      salesByDayMap[date] = {
        date,
        gross_sales: 0,
        orders: 0,
      };
    }

    salesByDayMap[date].gross_sales += Number(payment.amount);
    salesByDayMap[date].orders++;
  }

  const salesByDay = Object.values(salesByDayMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      date: item.date,
      gross_sales: Number(item.gross_sales.toFixed(2)),
      orders: item.orders,
    }));

  // ==========================================
  // Return
  // ==========================================

  return {
    period: {
      from: from || null,
      to: to || null,
    },

    summary: {
      gross_sales: Number(grossSales.toFixed(2)),
      refunded_amount: Number(refundedAmount.toFixed(2)),
      net_sales: Number(netSales.toFixed(2)),
      paid_orders: paidOrders,
      average_order_value: averageOrderValue,
    },

    sales_by_day: salesByDay,
  };
};

// ============================================
// Orders Report
// ============================================

const getOrdersReport = async ({ from, to }) => {
  const dateRange = buildDateRange({ from, to });

  let query = supabase
    .from("orders")
    .select("id, status, payment_status, total_amount, created_at");

  query = applyDateFilter(query, dateRange);

  const { data: orders, error } = await query;

  if (error) {
    console.error("ADMIN ORDERS REPORT ERROR:", error);
    throw new Error("Unable to calculate orders report.");
  }

  const summary = {
    total: orders.length,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    if (summary[order.status] !== undefined) {
      summary[order.status]++;
    }
  }

  // ==========================================
  // Orders By Day
  // ==========================================

  const ordersByDayMap = {};

  for (const order of orders) {
    const date = order.created_at.split("T")[0];

    if (!ordersByDayMap[date]) {
      ordersByDayMap[date] = {
        date,
        orders: 0,
      };
    }

    ordersByDayMap[date].orders++;
  }

  const ordersByDay = Object.values(ordersByDayMap).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    period: {
      from: from || null,
      to: to || null,
    },

    summary,

    orders_by_day: ordersByDay,
  };
};

// ============================================
// Product Performance Report
// ============================================

const getProductReport = async ({ from, to }) => {
  const dateRange = buildDateRange({ from, to });

  let query = supabase
    .from("order_items")
    .select(
      `
        product_name,
        quantity,
        subtotal,
        orders!inner (
          status,
          payment_status,
          created_at
        )
      `,
    )
    .in("orders.status", ["confirmed", "processing", "shipped", "delivered"])
    .in("orders.payment_status", ["paid", "refunded", "partially_refunded"]);

  if (dateRange.fromDate) {
    query = query.gte("orders.created_at", dateRange.fromDate);
  }

  if (dateRange.toDate) {
    query = query.lt(
      "orders.created_at",
      new Date(dateRange.toDate).toISOString(),
    );
  }

  const { data: orderItems, error } = await query;

  if (error) {
    console.error("ADMIN PRODUCT REPORT ERROR:", error);
    throw new Error("Unable to calculate product report.");
  }

  const productMap = {};

  for (const item of orderItems) {
    const productName = item.product_name;

    if (!productMap[productName]) {
      productMap[productName] = {
        product_name: productName,
        units_sold: 0,
        gross_sales: 0,
      };
    }

    productMap[productName].units_sold += Number(item.quantity);

    productMap[productName].gross_sales += Number(item.subtotal);
  }

  const products = Object.values(productMap)
    .sort((a, b) => {
      if (b.gross_sales !== a.gross_sales) {
        return b.gross_sales - a.gross_sales;
      }

      return b.units_sold - a.units_sold;
    })
    .map((product) => ({
      product_name: product.product_name,
      units_sold: product.units_sold,
      gross_sales: Number(product.gross_sales.toFixed(2)),
    }));

  return {
    period: {
      from: from || null,
      to: to || null,
    },

    products,
  };
};

// ============================================
// Inventory Report
// ============================================

const getInventoryReport = async () => {
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
        id,
        sku,
        quantity,
        price,
        track_inventory,
        is_active,
        products (
          id,
          name,
          slug
        )
      `,
    )
    .order("quantity", {
      ascending: true,
    });

  if (error) {
    console.error("ADMIN INVENTORY REPORT ERROR:", error);
    throw new Error("Unable to calculate inventory report.");
  }

  const trackedVariants = data.filter((variant) => variant.track_inventory);

  const outOfStock = trackedVariants.filter(
    (variant) => variant.quantity === 0,
  ).length;

  const lowStock = trackedVariants.filter(
    (variant) => variant.quantity > 0 && variant.quantity <= 5,
  ).length;

  const inventoryValue = trackedVariants.reduce(
    (sum, variant) => sum + Number(variant.quantity) * Number(variant.price),
    0,
  );

  return {
    summary: {
      total_variants: data.length,
      tracked_variants: trackedVariants.length,
      out_of_stock: outOfStock,
      low_stock: lowStock,
      inventory_value: Number(inventoryValue.toFixed(2)),
    },

    variants: data,
  };
};

// ============================================
// Coupon Report
// ============================================

const getCouponReport = async ({ from, to }) => {
  const dateRange = buildDateRange({ from, to });

  let query = supabase.from("coupon_usages").select(
    `
        coupon_id,
        discount_amount,
        created_at,
        coupons (
          id,
          code,
          description
        )
      `,
  );

  query = applyDateFilter(query, dateRange);

  const { data: usages, error } = await query;

  if (error) {
    console.error("ADMIN COUPON REPORT ERROR:", error);
    throw new Error("Unable to calculate coupon report.");
  }

  const couponMap = {};

  for (const usage of usages) {
    const coupon = usage.coupons;

    if (!coupon) {
      continue;
    }

    if (!couponMap[coupon.id]) {
      couponMap[coupon.id] = {
        coupon_id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        times_used: 0,
        discount_given: 0,
      };
    }

    couponMap[coupon.id].times_used++;

    couponMap[coupon.id].discount_given += Number(usage.discount_amount);
  }

  const coupons = Object.values(couponMap)
    .sort((a, b) => b.times_used - a.times_used)
    .map((coupon) => ({
      ...coupon,
      discount_given: Number(coupon.discount_given.toFixed(2)),
    }));

  return {
    period: {
      from: from || null,
      to: to || null,
    },

    coupons,
  };
};

// ============================================
// Exports
// ============================================

module.exports = {
  getSalesReport,
  getOrdersReport,
  getProductReport,
  getInventoryReport,
  getCouponReport,
};
