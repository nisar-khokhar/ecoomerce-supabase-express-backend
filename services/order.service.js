const supabase = require("../config/supabase");
const { refundOrder } = require("./payment.service");

// ============================================
// Get User Address
// ============================================

const getUserAddress = async (userId, addressId) => {
  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch address.");
  }

  if (!data) {
    throw new Error("Address not found.");
  }

  return data;
};

// ============================================
// Get Cart
// ============================================

const getCart = async (userId) => {
  const { data, error } = await supabase
    .from("carts")
    .select(
      `
      id,
      user_id,
      cart_items (
        id,
        product_variant_id,
        quantity
      )
    `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch cart.");
  }

  if (!data) {
    throw new Error("Cart not found.");
  }

  if (!data.cart_items || data.cart_items.length === 0) {
    throw new Error("Cart is empty.");
  }

  return data;
};

// ============================================
// Get Cart Variants
// ============================================

const getCartVariants = async (variantIds) => {
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      product_id,
      sku,
      price,
      quantity,
      track_inventory,
      is_active,

      products (
        id,
        name,
        slug,
        is_active
      ),

      product_variant_values (
        variant_values (
          id,
          value_code,
          label,

          variant_types (
            id,
            name
          )
        )
      )
    `,
    )
    .in("id", variantIds);

  if (error) {
    throw new Error("Unable to fetch product variants.");
  }

  return data;
};

// ============================================
// Build Variant Attributes Snapshot
// ============================================

const buildVariantAttributes = (variant) => {
  const attributes = {};

  for (const mapping of variant.product_variant_values || []) {
    const value = mapping.variant_values;

    if (!value) {
      continue;
    }

    const type = value.variant_types;

    if (!type) {
      continue;
    }

    attributes[type.name] = value.label;
  }

  return attributes;
};

// ============================================
// Validate Cart
// ============================================

const validateCart = async (cart) => {
  const variantIds = cart.cart_items.map((item) => item.product_variant_id);

  const variants = await getCartVariants(variantIds);

  if (variants.length !== variantIds.length) {
    throw new Error("One or more products in the cart no longer exist.");
  }

  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

  let subtotal = 0;

  const orderItems = [];

  for (const cartItem of cart.cart_items) {
    const variant = variantMap.get(cartItem.product_variant_id);

    if (!variant) {
      throw new Error("Product variant not found.");
    }

    if (!variant.is_active) {
      throw new Error(`${variant.sku} is no longer available.`);
    }

    if (!variant.products?.is_active) {
      throw new Error(
        `${variant.products?.name || "Product"} is no longer available.`,
      );
    }

    if (variant.track_inventory && cartItem.quantity > variant.quantity) {
      throw new Error(
        `Only ${variant.quantity} units of ${variant.sku} are available.`,
      );
    }

    const itemSubtotal = Number(variant.price) * cartItem.quantity;

    subtotal += itemSubtotal;

    orderItems.push({
      product_variant_id: variant.id,
      product_name: variant.products.name,
      variant_sku: variant.sku,
      variant_attributes: buildVariantAttributes(variant),
      quantity: cartItem.quantity,
      unit_price: variant.price,
      subtotal: itemSubtotal,
    });
  }

  return {
    subtotal,
    orderItems,
  };
};

// ============================================
// Generate Order Number
// ============================================

const generateOrderNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${timestamp}-${random}`;
};

// ============================================
// Create Order
// ============================================

const createOrder = async (userId, orderData) => {
  const { shipping_address_id, billing_address_id } = orderData;

  // Get cart
  const cart = await getCart(userId);

  // Get addresses
  const shippingAddress = await getUserAddress(userId, shipping_address_id);

  let billingAddress = null;

  if (billing_address_id) {
    billingAddress = await getUserAddress(userId, billing_address_id);
  }

  // Validate cart and build order snapshots
  const { subtotal, orderItems } = await validateCart(cart);

  const shippingFee = 0;
  const discountAmount = 0;
  const taxAmount = 0;

  const totalAmount = subtotal + shippingFee - discountAmount + taxAmount;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,

      order_number: generateOrderNumber(),

      status: "pending",

      payment_status: "pending",

      shipping_address: shippingAddress,

      billing_address: billingAddress,

      subtotal,

      shipping_fee: shippingFee,

      discount_amount: discountAmount,

      tax_amount: taxAmount,

      total_amount: totalAmount,
    })
    .select()
    .single();

  if (orderError) {
    throw new Error("Unable to create order.");
  }

  // Create order item snapshots
  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId);

  if (itemsError) {
    // Prevent leaving an incomplete order behind
    await supabase.from("orders").delete().eq("id", order.id);

    throw new Error("Unable to create order items.");
  }

  return await getOrderById(userId, order.id);
};

// ============================================
// Get Order By ID
// ============================================

const getOrderById = async (userId, orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      order_number,
      status,
      payment_status,

      shipping_address,
      billing_address,

      subtotal,
      shipping_fee,
      discount_amount,
      tax_amount,
      total_amount,

      created_at,
      updated_at,

      order_items (
        id,
        product_variant_id,
        product_name,
        variant_sku,
        variant_attributes,
        quantity,
        unit_price,
        subtotal,
        created_at
      )
    `,
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch order.");
  }

  if (!data) {
    throw new Error("Order not found.");
  }

  return data;
};

// ============================================
// Get User Orders
// ============================================

const getUserOrders = async (
  userId,
  { page = 1, limit = 10, status, payment_status } = {},
) => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        status,
        payment_status,
        subtotal,
        shipping_fee,
        discount_amount,
        tax_amount,
        total_amount,
        created_at,
        updated_at
      `,
      { count: "exact" },
    )
    .eq("user_id", userId);

  if (status) {
    query = query.eq("status", status);
  }

  if (payment_status) {
    query = query.eq("payment_status", payment_status);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Unable to fetch orders.");
  }

  const totalPages = Math.ceil(count / limit);

  return {
    orders: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// ============================================
// Order Status Transitions
// ============================================

const ORDER_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],

  confirmed: ["processing", "cancelled"],

  processing: ["shipped"],

  shipped: ["delivered"],

  delivered: [],

  cancelled: [],

  refunded: [],
};

// ============================================
// Validate Order Status Transition
// ============================================

const validateOrderStatusTransition = (currentStatus, newStatus) => {
  const allowedStatuses = ORDER_STATUS_TRANSITIONS[currentStatus];

  if (!allowedStatuses) {
    throw new Error(`Invalid current order status: ${currentStatus}.`);
  }

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(
      `Order cannot transition from ${currentStatus} to ${newStatus}.`,
    );
  }
};

// ============================================
// Update Order Status
// ============================================

const updateOrderStatus = async (orderId, newStatus) => {
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      order_number,
      status,
      payment_status
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to fetch order.");
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  // ============================================
  // Validate Status Transition
  // ============================================

  validateOrderStatusTransition(order.status, newStatus);

  // ============================================
  // Paid Order Required For Fulfillment
  // ============================================

  if (
    ["confirmed", "processing", "shipped", "delivered"].includes(newStatus) &&
    order.payment_status !== "paid"
  ) {
    throw new Error("Order must be paid before fulfillment.");
  }

  // ============================================
  // Update Order Status
  // ============================================

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
    })
    .eq("id", orderId)
    .select(
      `
      id,
      user_id,
      order_number,
      status,
      payment_status,
      shipping_address,
      billing_address,
      subtotal,
      shipping_fee,
      discount_amount,
      tax_amount,
      total_amount,
      created_at,
      updated_at,

      order_items (
        id,
        product_variant_id,
        product_name,
        variant_sku,
        variant_attributes,
        quantity,
        unit_price,
        subtotal,
        created_at
      )
    `,
    )
    .single();

  if (error) {
    throw new Error("Unable to update order status.");
  }

  return data;
};

// ============================================
// Cancel Order
// ============================================

const cancelOrder = async (userId, orderId) => {
  const order = await getOrderById(userId, orderId);

  // ==========================================
  // Validate Order Status Transition
  // ==========================================

  validateOrderStatusTransition(order.status, "cancelled");

  // ==========================================
  // Paid Orders Require Refund
  // ==========================================

  if (["paid", "partially_refunded"].includes(order.payment_status)) {
    throw new Error(
      "Paid orders cannot be cancelled directly. A refund is required.",
    );
  }

  // ==========================================
  // Cancel Unpaid Order
  // ==========================================

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("user_id", userId)
    .select(
      `
      id,
      user_id,
      order_number,
      status,
      payment_status,
      shipping_address,
      billing_address,
      subtotal,
      shipping_fee,
      discount_amount,
      tax_amount,
      total_amount,
      created_at,
      updated_at,

      order_items (
        id,
        product_variant_id,
        product_name,
        variant_sku,
        variant_attributes,
        quantity,
        unit_price,
        subtotal,
        created_at
      )
      `,
    )
    .single();

  if (error) {
    throw new Error("Unable to cancel order.");
  }

  return data;
};

// ============================================
// Cancel Paid Order
// ============================================

const cancelPaidOrder = async (userId, orderId) => {
  const order = await getOrderById(userId, orderId);

  // ==========================================
  // Validate Order Status
  // ==========================================

  validateOrderStatusTransition(order.status, "cancelled");

  // ==========================================
  // Verify Payment
  // ==========================================

  if (!["paid", "partially_refunded"].includes(order.payment_status)) {
    throw new Error("Order does not require a refund.");
  }

  // ==========================================
  // Initiate Refund
  // ==========================================

  await refundOrder({
    orderId: order.id,
    reason: "Customer cancelled order.",
    cancellation: true,
  });

  // ==========================================
  // Do NOT immediately mark order cancelled
  // ==========================================
  //
  // Stripe webhook remains authoritative.
  //
  // The refund webhook will update payment_status.
  //
  // We will handle cancellation state there.
  // ==========================================

  return {
    message: "Order cancellation and refund initiated.",
  };
};

// ============================================
// Admin - Get All Orders
// ============================================

const getAllOrders = async ({
  page = 1,
  limit = 10,
  status,
  payment_status,
} = {}) => {
  const offset = (page - 1) * limit;

  let query = supabase.from("orders").select(
    `
        id,
        user_id,
        order_number,
        status,
        payment_status,
        subtotal,
        shipping_fee,
        discount_amount,
        tax_amount,
        total_amount,
        created_at,
        updated_at
      `,
    { count: "exact" },
  );

  if (status) {
    query = query.eq("status", status);
  }

  if (payment_status) {
    query = query.eq("payment_status", payment_status);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Unable to fetch orders.");
  }

  const totalPages = Math.ceil(count / limit);

  return {
    orders: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// ============================================
// Admin - Get Order By ID
// ============================================

const getAdminOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      order_number,
      status,
      payment_status,
      shipping_address,
      billing_address,
      subtotal,
      shipping_fee,
      discount_amount,
      tax_amount,
      total_amount,
      created_at,
      updated_at,

      order_items (
        id,
        product_variant_id,
        product_name,
        variant_sku,
        variant_attributes,
        quantity,
        unit_price,
        subtotal,
        created_at
      )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch order.");
  }

  if (!data) {
    throw new Error("Order not found.");
  }

  return data;
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,

  getAllOrders,
  getAdminOrderById,

  updateOrderStatus,
  cancelOrder,
  cancelPaidOrder,

  validateOrderStatusTransition,
};
