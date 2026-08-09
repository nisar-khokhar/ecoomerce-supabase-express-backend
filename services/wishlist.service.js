const supabase = require("../config/supabase");
const { validateProductIsActive } = require("./product.service");

const WISHLIST_SELECT = `
  id,
  created_at,
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
    ),

    product_variants (
      id,
      sku,
      barcode,
      price,
      compare_price,
      quantity,
      weight,
      track_inventory,
      is_active,

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

const getWishlistItem = async (userId, productId) => {
  const { data, error } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch wishlist item.");
  }

  return data;
};

const getWishlistItems = async (userId) => {
  const { data, error } = await supabase
    .from("wishlist")
    .select(WISHLIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to fetch wishlist.");
  }

  return data;
};

const createWishlistItem = async (userId, productId) => {
  const { data, error } = await supabase
    .from("wishlist")
    .insert({
      user_id: userId,
      product_id: productId,
    })
    .select(WISHLIST_SELECT)
    .single();

  if (error) {
    throw new Error("Unable to add product to wishlist.");
  }

  return data;
};

const deleteWishlistItem = async (userId, productId) => {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error("Unable to remove product from wishlist.");
  }
};

const getWishlist = async (userId) => {
  return await getWishlistItems(userId);
};

const addToWishlist = async (userId, productId) => {
  // Verify product exists
  const product = await validateProductIsActive(productId);

  // Prevent duplicates
  const existingItem = await getWishlistItem(userId, productId);

  if (existingItem) {
    throw new Error("Product is already in your wishlist.");
  }

  return await createWishlistItem(userId, productId);
};

const removeFromWishlist = async (userId, productId) => {
  const existingItem = await getWishlistItem(userId, productId);

  if (!existingItem) {
    throw new Error("Wishlist item not found.");
  }

  await deleteWishlistItem(userId, productId);
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
