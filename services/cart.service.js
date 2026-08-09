const supabase = require("../config/supabase");
const { formatCart } = require("../utils/cartFormatter");

// ============================================
// Cart Select
// ============================================

const CART_SELECT = `
  id,
  user_id,
  created_at,
  updated_at,

  cart_items (
    id,
    quantity,
    created_at,
    updated_at,

    product_variants (
      id,
      product_id,
      sku,
      barcode,
      price,
      compare_price,
      quantity,
      weight,
      track_inventory,
      is_active,

      products (
        id,
        name,
        slug,

        product_images (
          id,
          image_path,
          alt_text,
          sort_order,
          is_primary
        )
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
    )
  )
`;

// ============================================
// Get Cart
// ============================================

const getCartByUserId = async (userId) => {
  const { data, error } = await supabase
    .from("carts")
    .select(CART_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch cart.");
  }

  return data;
};

// ============================================
// Create Cart
// ============================================

const createCart = async (userId) => {
  const { data, error } = await supabase
    .from("carts")
    .insert({
      user_id: userId,
    })
    .select(CART_SELECT)
    .single();

  if (error) {
    throw new Error("Unable to create cart.");
  }

  return data;
};

// ============================================
// Get Or Create Cart
// ============================================

const getOrCreateCart = async (userId) => {
  const existingCart = await getCartByUserId(userId);

  if (existingCart) {
    return formatCart(existingCart);
  }

  const cart = await createCart(userId);

  return formatCart(cart);
};

// ============================================
// Get Product Variant
// ============================================

const getProductVariant = async (variantId) => {
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      product_id,
      sku,
      barcode,
      price,
      compare_price,
      quantity,
      weight,
      track_inventory,
      is_active,

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
    throw new Error("Unable to fetch product variant.");
  }

  if (!data) {
    throw new Error("Product variant not found.");
  }

  return data;
};

// ============================================
// Validate Variant For Cart
// ============================================

const validateVariantForCart = async (variantId, requestedQuantity) => {
  const variant = await getProductVariant(variantId);

  if (!variant.is_active) {
    throw new Error("Product variant is unavailable.");
  }

  if (!variant.products?.is_active) {
    throw new Error("Product is unavailable.");
  }

  if (variant.track_inventory && requestedQuantity > variant.quantity) {
    throw new Error(`Only ${variant.quantity} units are available.`);
  }

  return variant;
};

// ============================================
// Get Existing Cart Item
// ============================================

const getCartItem = async (cartId, variantId) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      cart_id,
      product_variant_id,
      quantity
    `,
    )
    .eq("cart_id", cartId)
    .eq("product_variant_id", variantId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch cart item.");
  }

  return data;
};

// ============================================
// Add Cart Item
// ============================================

const addCartItem = async (userId, variantId, quantity) => {
  const cart = await getOrCreateCart(userId);

  const existingItem = await getCartItem(cart.id, variantId);

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  await validateVariantForCart(variantId, newQuantity);

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: newQuantity,
      })
      .eq("id", existingItem.id);

    if (error) {
      throw new Error("Unable to update cart item.");
    }
  } else {
    const { error } = await supabase.from("cart_items").insert({
      cart_id: cart.id,
      product_variant_id: variantId,
      quantity,
    });

    if (error) {
      throw new Error("Unable to add item to cart.");
    }
  }

  return formatCart(await getCartByUserId(userId));
};

// ============================================
// Update Cart Item Quantity
// ============================================

const updateCartItem = async (userId, variantId, quantity) => {
  const cart = await getCartByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found.");
  }

  const existingItem = await getCartItem(cart.id, variantId);

  if (!existingItem) {
    throw new Error("Cart item not found.");
  }

  await validateVariantForCart(variantId, quantity);

  const { error } = await supabase
    .from("cart_items")
    .update({
      quantity,
    })
    .eq("id", existingItem.id);

  if (error) {
    throw new Error("Unable to update cart item.");
  }

  return formatCart(await getCartByUserId(userId));
};

// ============================================
// Remove Cart Item
// ============================================

const removeCartItem = async (userId, variantId) => {
  const cart = await getCartByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found.");
  }

  const existingItem = await getCartItem(cart.id, variantId);

  if (!existingItem) {
    throw new Error("Cart item not found.");
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", existingItem.id);

  if (error) {
    throw new Error("Unable to remove cart item.");
  }

  return formatCart(await getCartByUserId(userId));
};

// ============================================
// Clear Cart
// ============================================

const clearCart = async (userId) => {
  const cart = await getCartByUserId(userId);

  if (!cart) {
    throw new Error("Cart not found.");
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  if (error) {
    throw new Error("Unable to clear cart.");
  }

  return formatCart(await getCartByUserId(userId));
};

// ============================================
// Exports
// ============================================

module.exports = {
  getOrCreateCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
