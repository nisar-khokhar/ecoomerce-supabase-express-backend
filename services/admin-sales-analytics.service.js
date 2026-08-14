const supabase = require("../config/supabase");

// ============================================
// Admin Sales Analytics
// ============================================

const getSalesAnalytics = async () => {
  // ==========================================
  // 1. Successful Payments
  // ==========================================

  const { data: successfulPayments, error: paymentError } = await supabase
    .from("payments")
    .select("amount, status, created_at")
    .in("status", ["paid", "refunded", "partially_refunded"]);

  if (paymentError) {
    console.error("ADMIN SALES PAYMENT ANALYTICS ERROR:", paymentError);

    throw new Error("Unable to calculate sales analytics.");
  }

  // ==========================================
  // Gross Sales
  // ==========================================

  const grossSales = successfulPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  // ==========================================
  // 2. Successful Refunds
  // ==========================================

  const { data: successfulRefunds, error: refundError } = await supabase
    .from("refunds")
    .select("amount, created_at")
    .eq("status", "succeeded");

  if (refundError) {
    console.error("ADMIN SALES REFUND ANALYTICS ERROR:", refundError);

    throw new Error("Unable to calculate refund analytics.");
  }

  const refundedAmount = successfulRefunds.reduce(
    (sum, refund) => sum + Number(refund.amount),
    0,
  );

  const netSales = grossSales - refundedAmount;

  // ==========================================
  // 3. Unique Successful Orders
  // ==========================================

  const { data: successfulOrders, error: orderError } = await supabase
    .from("orders")
    .select(
      `
          id,
          status,
          payment_status,
          total_amount,
          created_at
        `,
    )
    .in("payment_status", ["paid", "refunded", "partially_refunded"]);

  if (orderError) {
    console.error("ADMIN SALES ORDER ANALYTICS ERROR:", orderError);

    throw new Error("Unable to calculate order analytics.");
  }

  const paidOrders = successfulOrders.length;

  const averageOrderValue =
    paidOrders > 0 ? Number((grossSales / paidOrders).toFixed(2)) : 0;

  // ==========================================
  // 4. Overall Order Statistics
  // ==========================================

  const { data: allOrders, error: allOrdersError } = await supabase
    .from("orders")
    .select(
      `
          id,
          status,
          payment_status,
          total_amount,
          created_at
        `,
    );

  if (allOrdersError) {
    console.error("ADMIN SALES ALL ORDERS ERROR:", allOrdersError);

    throw new Error("Unable to fetch order statistics.");
  }

  const orderStats = {
    total: allOrders.length,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of allOrders) {
    if (orderStats[order.status] !== undefined) {
      orderStats[order.status]++;
    }
  }

  // ==========================================
  // 5. Sales By Day
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
  // 6. Top Products
  // ==========================================
  //
  // Exclude cancelled orders because those
  // products were not actually sold.
  //
  // Use order_items snapshot fields so historical
  // product names/prices remain accurate.
  // ==========================================

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
          product_name,
          quantity,
          subtotal,
          orders!inner (
            status,
            payment_status
          )
        `,
    )
    .in("orders.status", ["confirmed", "processing", "shipped", "delivered"])
    .in("orders.payment_status", ["paid", "refunded", "partially_refunded"]);

  if (itemsError) {
    console.error("ADMIN SALES PRODUCT ANALYTICS ERROR:", itemsError);

    throw new Error("Unable to calculate product analytics.");
  }

  const productMap = {};

  for (const item of orderItems) {
    const productName = item.product_name;

    if (!productMap[productName]) {
      productMap[productName] = {
        product_name: productName,
        units_sold: 0,
        sales: 0,
      };
    }

    productMap[productName].units_sold += Number(item.quantity);

    productMap[productName].sales += Number(item.subtotal);
  }

  const topProducts = Object.values(productMap)
    .sort((a, b) => {
      if (b.units_sold !== a.units_sold) {
        return b.units_sold - a.units_sold;
      }

      return b.sales - a.sales;
    })
    .slice(0, 10)
    .map((product) => ({
      product_name: product.product_name,
      units_sold: product.units_sold,
      sales: Number(product.sales.toFixed(2)),
    }));

  // ==========================================
  // Return Analytics
  // ==========================================

  return {
    summary: {
      gross_sales: Number(grossSales.toFixed(2)),

      refunded_amount: Number(refundedAmount.toFixed(2)),

      net_sales: Number(netSales.toFixed(2)),

      paid_orders: paidOrders,

      average_order_value: averageOrderValue,
    },

    orders: orderStats,

    sales_by_day: salesByDay,

    top_products: topProducts,
  };
};

module.exports = {
  getSalesAnalytics,
};
