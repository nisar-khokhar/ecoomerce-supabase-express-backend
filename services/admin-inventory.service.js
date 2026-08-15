/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");

// ============================================
// Get Admin Inventory
// ============================================

const getInventory = async ({
  page = 1,
  limit = 20,
  search,
  lowStock,
  isActive,
}) => {
  const offset = (page - 1) * limit;

  let query = supabase.from("product_variants").select(
    `
        id,
        product_id,
        sku,
        price,
        quantity,
        track_inventory,
        is_active,
        created_at,
        updated_at,

        products (
          id,
          name,
          slug,
          is_active
        )
      `,
    { count: "exact" },
  );

  // ==========================================
  // Search by SKU
  // ==========================================

  if (search) {
    query = query.ilike("sku", `%${search}%`);
  }

  // ==========================================
  // Filter Active / Inactive
  // ==========================================

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  // ==========================================
  // Low Stock
  // ==========================================

  // For now, low stock means quantity <= 5.
  // We will make this configurable later
  // when we introduce inventory settings.

  if (lowStock === true) {
    query = query.eq("track_inventory", true).lte("quantity", 5);
  }

  // ==========================================
  // Pagination
  // ==========================================

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("ADMIN GET INVENTORY ERROR:", error);

    throw new Error("Unable to fetch inventory.");
  }

  const totalPages = Math.ceil(count / limit);

  return {
    inventory: data,

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
// Get Inventory Variant
// ============================================

const getInventoryVariant = async (variantId) => {
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
        created_at,
        updated_at,

        products (
          id,
          name,
          slug,
          is_active
        )
      `,
    )
    .eq("id", variantId)
    .maybeSingle();

  if (error) {
    console.error("ADMIN GET INVENTORY VARIANT ERROR:", error);

    throw new Error("Unable to fetch inventory variant.");
  }

  if (!data) {
    throw new Error("Inventory variant not found.");
  }

  return data;
};

// ============================================
// Update Inventory Variant
// ============================================

const updateInventoryVariant = async ({
  variantId,
  quantity,
  type,
  reason,
  adminUserId,
}) => {
  const { data, error } = await supabase.rpc("admin_adjust_inventory", {
    p_variant_id: variantId,
    p_new_quantity: quantity,
    p_type: type,
    p_reason: reason,
    p_admin_user_id: adminUserId,
  });

  if (error) {
    console.error("ADMIN UPDATE INVENTORY ERROR:", error);

    throw new Error(error.message || "Unable to update inventory.");
  }

  return data;
};
// ============================================
// Get Inventory Movements
// ============================================

const getInventoryMovements = async ({
  variantId,
  page = 1,
  limit = 20,
  type,
}) => {
  const offset = (page - 1) * limit;

  // Verify variant exists
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("id", variantId)
    .maybeSingle();

  if (variantError) {
    throw new Error("Unable to fetch inventory variant.");
  }

  if (!variant) {
    throw new Error("Inventory variant not found.");
  }

  let query = supabase
    .from("inventory_movements")
    .select(
      `
        id,
        product_variant_id,
        type,
        quantity,
        previous_quantity,
        new_quantity,
        reason,
        reference_type,
        reference_id,
        created_by,
        created_at,

        product_variants (
          id,
          sku,
          product_id,

          products (
            id,
            name,
            slug
          )
        )
      `,
      { count: "exact" },
    )
    .eq("product_variant_id", variantId);

  if (type !== undefined) {
    query = query.eq("type", type);
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("GET INVENTORY MOVEMENTS ERROR:", error);

    throw new Error("Unable to fetch inventory movements.");
  }

  const totalPages = Math.ceil(count / limit);

  return {
    movements: data,

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

module.exports = {
  getInventory,
  getInventoryVariant,
  updateInventoryVariant,
  getInventoryMovements,
};
