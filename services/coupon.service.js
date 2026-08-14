const supabase = require("../config/supabase");

// ============================================
// Helpers
// ============================================

const normalizeCoupon = (coupon) => {
  if (!coupon) {
    return coupon;
  }

  return {
    ...coupon,

    product_ids: coupon.coupon_products?.map((item) => item.product_id) || [],

    category_ids:
      coupon.coupon_categories?.map((item) => item.category_id) || [],
  };
};

// ============================================
// Create Coupon
// ============================================

const createCoupon = async (payload) => {
  const { product_ids = [], category_ids = [], ...couponData } = payload;

  const { data: existingCoupon, error: existingError } = await supabase
    .from("coupons")
    .select("id")
    .ilike("code", couponData.code)
    .maybeSingle();

  if (existingError) {
    throw new Error("Unable to check coupon code.");
  }

  if (existingCoupon) {
    throw new Error("Coupon code already exists.");
  }

  // ==========================================
  // Validate Products
  // ==========================================

  if (product_ids.length > 0) {
    const { data: products, error } = await supabase
      .from("products")
      .select("id")
      .in("id", product_ids);

    if (error) {
      throw new Error("Unable to validate products.");
    }

    if (products.length !== product_ids.length) {
      throw new Error("One or more products do not exist.");
    }
  }

  // ==========================================
  // Validate Categories
  // ==========================================

  if (category_ids.length > 0) {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id")
      .in("id", category_ids);

    if (error) {
      throw new Error("Unable to validate categories.");
    }

    if (categories.length !== category_ids.length) {
      throw new Error("One or more categories do not exist.");
    }
  }

  // ==========================================
  // Create Coupon
  // ==========================================

  const { data: coupon, error: couponError } = await supabase
    .from("coupons")
    .insert({
      ...couponData,
      code: couponData.code.toUpperCase(),
      minimum_order_amount: couponData.minimum_order_amount ?? 0,
      first_order_only: couponData.first_order_only ?? false,
      is_active: couponData.is_active ?? true,
    })
    .select("*")
    .single();

  if (couponError) {
    console.error("CREATE COUPON ERROR:", couponError);

    throw new Error("Unable to create coupon.");
  }

  // ==========================================
  // Insert Product Restrictions
  // ==========================================

  if (product_ids.length > 0) {
    const rows = product_ids.map((productId) => ({
      coupon_id: coupon.id,
      product_id: productId,
    }));

    const { error } = await supabase.from("coupon_products").insert(rows);

    if (error) {
      console.error("CREATE COUPON PRODUCTS ERROR:", error);

      throw new Error("Unable to configure coupon products.");
    }
  }

  // ==========================================
  // Insert Category Restrictions
  // ==========================================

  if (category_ids.length > 0) {
    const rows = category_ids.map((categoryId) => ({
      coupon_id: coupon.id,
      category_id: categoryId,
    }));

    const { error } = await supabase.from("coupon_categories").insert(rows);

    if (error) {
      console.error("CREATE COUPON CATEGORIES ERROR:", error);

      throw new Error("Unable to configure coupon categories.");
    }
  }

  return getCouponById(coupon.id);
};

// ============================================
// Get Coupon By ID
// ============================================

const getCouponById = async (couponId) => {
  const { data, error } = await supabase
    .from("coupons")
    .select(
      `
        *,
        coupon_products (
          product_id
        ),
        coupon_categories (
          category_id
        )
      `,
    )
    .eq("id", couponId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch coupon.");
  }

  if (!data) {
    throw new Error("Coupon not found.");
  }

  return normalizeCoupon(data);
};

// ============================================
// Get All Coupons
// ============================================

const getAllCoupons = async ({
  page = 1,
  limit = 20,
  is_active,
  search,
} = {}) => {
  const offset = (page - 1) * limit;

  let query = supabase.from("coupons").select("*", {
    count: "exact",
  });

  if (is_active !== undefined) {
    query = query.eq("is_active", is_active);
  }

  if (search) {
    query = query.ilike("code", `%${search}%`);
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Unable to fetch coupons.");
  }

  const coupons = await Promise.all(
    data.map((coupon) => getCouponById(coupon.id)),
  );

  const totalPages = Math.ceil(count / limit);

  return {
    coupons,
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
// Update Coupon
// ============================================

const updateCoupon = async (couponId, payload) => {
  const { product_ids, category_ids, ...couponData } = payload;

  const existingCoupon = await getCouponById(couponId);

  // ==========================================
  // Validate New Code
  // ==========================================

  if (
    couponData.code &&
    couponData.code.toUpperCase() !== existingCoupon.code.toUpperCase()
  ) {
    const { data: duplicate, error } = await supabase
      .from("coupons")
      .select("id")
      .ilike("code", couponData.code)
      .neq("id", couponId)
      .maybeSingle();

    if (error) {
      throw new Error("Unable to check coupon code.");
    }

    if (duplicate) {
      throw new Error("Coupon code already exists.");
    }
  }

  // ==========================================
  // Validate Products
  // ==========================================

  if (product_ids !== undefined) {
    if (product_ids.length > 0) {
      const { data: products, error } = await supabase
        .from("products")
        .select("id")
        .in("id", product_ids);

      if (error) {
        throw new Error("Unable to validate products.");
      }

      if (products.length !== product_ids.length) {
        throw new Error("One or more products do not exist.");
      }
    }
  }

  // ==========================================
  // Validate Categories
  // ==========================================

  if (category_ids !== undefined) {
    if (category_ids.length > 0) {
      const { data: categories, error } = await supabase
        .from("categories")
        .select("id")
        .in("id", category_ids);

      if (error) {
        throw new Error("Unable to validate categories.");
      }

      if (categories.length !== category_ids.length) {
        throw new Error("One or more categories do not exist.");
      }
    }
  }

  // ==========================================
  // Update Coupon
  // ==========================================

  if (Object.keys(couponData).length > 0) {
    if (couponData.code) {
      couponData.code = couponData.code.toUpperCase();
    }

    const { error } = await supabase
      .from("coupons")
      .update(couponData)
      .eq("id", couponId);

    if (error) {
      console.error("UPDATE COUPON ERROR:", error);

      throw new Error("Unable to update coupon.");
    }
  }

  // ==========================================
  // Replace Product Restrictions
  // ==========================================

  if (product_ids !== undefined) {
    const { error: deleteError } = await supabase
      .from("coupon_products")
      .delete()
      .eq("coupon_id", couponId);

    if (deleteError) {
      throw new Error("Unable to update coupon products.");
    }

    if (product_ids.length > 0) {
      const rows = product_ids.map((productId) => ({
        coupon_id: couponId,
        product_id: productId,
      }));

      const { error } = await supabase.from("coupon_products").insert(rows);

      if (error) {
        throw new Error("Unable to update coupon products.");
      }
    }
  }

  // ==========================================
  // Replace Category Restrictions
  // ==========================================

  if (category_ids !== undefined) {
    const { error: deleteError } = await supabase
      .from("coupon_categories")
      .delete()
      .eq("coupon_id", couponId);

    if (deleteError) {
      throw new Error("Unable to update coupon categories.");
    }

    if (category_ids.length > 0) {
      const rows = category_ids.map((categoryId) => ({
        coupon_id: couponId,
        category_id: categoryId,
      }));

      const { error } = await supabase.from("coupon_categories").insert(rows);

      if (error) {
        throw new Error("Unable to update coupon categories.");
      }
    }
  }

  return getCouponById(couponId);
};

// ============================================
// Delete / Deactivate Coupon
// ============================================

const deactivateCoupon = async (couponId) => {
  await getCouponById(couponId);

  const { data, error } = await supabase
    .from("coupons")
    .update({
      is_active: false,
    })
    .eq("id", couponId)
    .select("*")
    .single();

  if (error) {
    throw new Error("Unable to deactivate coupon.");
  }

  return data;
};

const getCouponByCode = async (code) => {
  const normalizedCode = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      `
        *,
        coupon_products (
          product_id
        ),
        coupon_categories (
          category_id
        )
      `,
    )
    .ilike("code", normalizedCode)
    .maybeSingle();

  if (error) {
    console.error("GET COUPON BY CODE ERROR:", error);

    throw new Error("Unable to fetch coupon.");
  }

  if (!data) {
    throw new Error("Invalid coupon code.");
  }

  return normalizeCoupon(data);
};

// ============================================
// Get User Cart For Coupon Validation
// ============================================

const getUserCartForCoupon = async (userId) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
        id,
        cart_id,
        product_variant_id,
        quantity,

        carts!inner (
          id,
          user_id
        ),

        product_variants!inner (
          id,
          product_id,
          price,

          products!inner (
            id,
            name,
            category_id
          )
        )
      `,
    )
    .eq("carts.user_id", userId);

  if (error) {
    console.error("GET CART FOR COUPON ERROR:", error);

    throw new Error("Unable to fetch cart.");
  }

  if (!data || data.length === 0) {
    throw new Error("Your cart is empty.");
  }

  return data;
};

// ============================================
// Check Previous Successful Order
// ============================================

const hasPreviousSuccessfulOrder = async (userId) => {
  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .in("payment_status", ["paid", "refunded", "partially_refunded"])
    .limit(1);

  if (error) {
    console.error("CHECK FIRST ORDER ERROR:", error);

    throw new Error("Unable to determine customer order history.");
  }

  return data.length > 0;
};

// ============================================
// Get Coupon Usage
// ============================================

const getCouponUsage = async (couponId, userId) => {
  const { data, error } = await supabase
    .from("coupon_usages")
    .select(
      `
        id,
        user_id
      `,
    )
    .eq("coupon_id", couponId);

  if (error) {
    console.error("GET COUPON USAGE ERROR:", error);

    throw new Error("Unable to check coupon usage.");
  }

  const totalUsage = data.length;

  const userUsage = data.filter((usage) => usage.user_id === userId).length;

  return {
    totalUsage,
    userUsage,
  };
};

// ============================================
// Validate Coupon Usage
// ============================================

const validateCouponUsage = (coupon, usage) => {
  if (
    coupon.usage_limit !== null &&
    coupon.usage_limit !== undefined &&
    usage.totalUsage >= coupon.usage_limit
  ) {
    throw new Error("Coupon usage limit has been reached.");
  }

  if (
    coupon.usage_limit_per_user !== null &&
    coupon.usage_limit_per_user !== undefined &&
    usage.userUsage >= coupon.usage_limit_per_user
  ) {
    throw new Error("You have reached the usage limit for this coupon.");
  }
};

// ============================================
// Validate Coupon Availability
// ============================================

const validateCouponAvailability = (coupon) => {
  if (!coupon.is_active) {
    throw new Error("This coupon is inactive.");
  }

  const now = new Date();

  if (coupon.starts_at && now < new Date(coupon.starts_at)) {
    throw new Error("This coupon is not active yet.");
  }

  if (coupon.expires_at && now >= new Date(coupon.expires_at)) {
    throw new Error("This coupon has expired.");
  }
};

// ============================================
// Determine Eligible Cart Items
// ============================================

const getEligibleCartItems = (cartItems, coupon) => {
  const hasProductRestrictions =
    coupon.product_ids && coupon.product_ids.length > 0;

  const hasCategoryRestrictions =
    coupon.category_ids && coupon.category_ids.length > 0;

  // ==========================================
  // No Restrictions
  // ==========================================

  if (!hasProductRestrictions && !hasCategoryRestrictions) {
    return cartItems;
  }

  // ==========================================
  // Product / Category Restrictions
  // ==========================================

  return cartItems.filter((item) => {
    const product = item.product_variants.products;

    const productMatches =
      hasProductRestrictions && coupon.product_ids.includes(product.id);

    const categoryMatches =
      hasCategoryRestrictions &&
      coupon.category_ids.includes(product.category_id);

    // Product OR category
    return productMatches || categoryMatches;
  });
};

// ============================================
// Calculate Subtotal
// ============================================

const calculateCartSubtotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const price = Number(item.product_variants.price);

    const quantity = Number(item.quantity);

    return total + price * quantity;
  }, 0);
};

// ============================================
// Calculate Discount
// ============================================

const calculateDiscount = (coupon, eligibleSubtotal) => {
  let discount = 0;

  if (coupon.discount_type === "percentage") {
    discount = eligibleSubtotal * (Number(coupon.discount_value) / 100);

    if (
      coupon.maximum_discount_amount !== null &&
      coupon.maximum_discount_amount !== undefined
    ) {
      discount = Math.min(discount, Number(coupon.maximum_discount_amount));
    }
  }

  if (coupon.discount_type === "fixed") {
    discount = Math.min(Number(coupon.discount_value), eligibleSubtotal);
  }

  return Number(discount.toFixed(2));
};

// ============================================
// Validate Coupon
// ============================================

const validateCoupon = async ({ userId, code }) => {
  // ==========================================
  // Get Coupon
  // ==========================================

  const coupon = await getCouponByCode(code);

  // ==========================================
  // Validate Availability
  // ==========================================

  validateCouponAvailability(coupon);

  // ==========================================
  // Check Usage Limits
  // ==========================================

  const usage = await getCouponUsage(coupon.id, userId);

  validateCouponUsage(coupon, usage);

  // ==========================================
  // First Order Requirement
  // ==========================================

  if (coupon.first_order_only) {
    const hasPreviousOrder = await hasPreviousSuccessfulOrder(userId);

    if (hasPreviousOrder) {
      throw new Error("This coupon is only valid for your first order.");
    }
  }

  // ==========================================
  // Get Actual Cart
  // ==========================================

  const cartItems = await getUserCartForCoupon(userId);

  // ==========================================
  // Calculate Full Cart Subtotal
  // ==========================================

  const cartSubtotal = calculateCartSubtotal(cartItems);

  // ==========================================
  // Minimum Order Requirement
  // ==========================================

  if (cartSubtotal < Number(coupon.minimum_order_amount || 0)) {
    throw new Error(
      `Minimum order amount for this coupon is ${coupon.minimum_order_amount}.`,
    );
  }

  // ==========================================
  // Determine Eligible Items
  // ==========================================

  const eligibleItems = getEligibleCartItems(cartItems, coupon);

  if (eligibleItems.length === 0) {
    throw new Error("This coupon does not apply to any products in your cart.");
  }

  // ==========================================
  // Eligible Subtotal
  // ==========================================

  const eligibleSubtotal = calculateCartSubtotal(eligibleItems);

  // ==========================================
  // Calculate Discount
  // ==========================================

  const discountAmount = calculateDiscount(coupon, eligibleSubtotal);

  if (discountAmount <= 0) {
    throw new Error(
      "This coupon does not provide a valid discount for your cart.",
    );
  }

  // ==========================================
  // Final Subtotal
  // ==========================================

  const finalSubtotal = Number(cartSubtotal - discountAmount).toFixed(2);

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
    },

    cart_subtotal: Number(cartSubtotal.toFixed(2)),

    eligible_subtotal: Number(eligibleSubtotal.toFixed(2)),

    discount_amount: discountAmount,

    final_subtotal: Number(finalSubtotal),
  };
};

// ============================================
// Record Coupon Usage
// ============================================

const recordCouponUsage = async (orderId) => {
  // ==========================================
  // Get Order
  // ==========================================

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      coupon_id,
      discount_amount,
      payment_status
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    console.error("GET COUPON ORDER ERROR:", orderError);
    throw new Error("Unable to fetch order for coupon usage.");
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  // ==========================================
  // No Coupon Applied
  // ==========================================

  if (!order.coupon_id) {
    return null;
  }

  // ==========================================
  // Payment Must Be Successful
  // ==========================================

  if (order.payment_status !== "paid") {
    throw new Error("Coupon usage can only be recorded for paid orders.");
  }

  // ==========================================
  // Prevent Duplicate Usage
  // ==========================================

  const { data: existingUsage, error: existingError } = await supabase
    .from("coupon_usages")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existingError) {
    console.error("CHECK COUPON USAGE ERROR:", existingError);

    throw new Error("Unable to check existing coupon usage.");
  }

  if (existingUsage) {
    console.log(`Coupon usage already recorded for order ${order.id}.`);

    return existingUsage;
  }

  // ==========================================
  // Create Coupon Usage
  // ==========================================

  const { data, error } = await supabase
    .from("coupon_usages")
    .insert({
      coupon_id: order.coupon_id,
      user_id: order.user_id,
      order_id: order.id,
      discount_amount: order.discount_amount,
    })
    .select(
      `
      id,
      coupon_id,
      user_id,
      order_id,
      discount_amount,
      created_at
    `,
    )
    .single();

  if (error) {
    console.error("CREATE COUPON USAGE ERROR:", error);

    throw new Error("Unable to record coupon usage.");
  }

  console.log(
    `Coupon ${order.coupon_id} usage recorded for order ${order.id}.`,
  );

  return data;
};

module.exports = {
  createCoupon,
  getCouponById,
  getAllCoupons,
  updateCoupon,
  deactivateCoupon,

  getCouponByCode,
  getUserCartForCoupon,
  hasPreviousSuccessfulOrder,
  getCouponUsage,
  validateCouponUsage,
  validateCouponAvailability,
  getEligibleCartItems,
  calculateCartSubtotal,
  calculateDiscount,
  validateCoupon,
  recordCouponUsage,
};
