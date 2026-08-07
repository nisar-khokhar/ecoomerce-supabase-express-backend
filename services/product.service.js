const {
  applyProductFilters,
  applySorting,
  applyPagination,
} = require("../helpers/productQueryBuilder");

const supabase = require("../config/supabase");

const getAllProducts = async (options) => {
  const { pagination = {}, filters = {}, sorting = {} } = options;

  const { page = 1, limit = 10 } = pagination;

  let query = buildProductsQuery();

  query = applyProductFilters(query, filters);
  query = applySorting(query, sorting);
  query = applyPagination(query, pagination);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("Unable to fetch products.");
  }

  const totalPages = Math.ceil(count / limit);

  return {
    products: data,
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

const getProductById = async (id) => {
  const product = await getProduct(id);

  product.product_images = await getProductImages(id);

  return product;
};

const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to create product.");
  }

  return data;
};

const updateProduct = async (id, productData) => {
  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to update product.");
  }

  return data;
};

const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete product.");
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

/**
 *
 * These are private helper functions that are not exported
 * and are used internally within the product service to fetch
 * product details and images from the database.
 */

const getProduct = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(id, name, slug),
      brands(id, name, slug)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Product not found.");
  }

  return data;
};

const getProductImages = async (productId) => {
  const { data, error } = await supabase
    .from("product_images")
    .select(
      `
      id,
      image_path,
      alt_text,
      sort_order,
      is_primary
    `,
    )
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Unable to fetch product images.");
  }

  return data;
};

const buildProductsQuery = () => {
  return supabase.from("products").select(
    `
      *,
      categories(id, name, slug),
      brands(id, name, slug),
      product_images(
        id,
        image_path,
        alt_text,
        sort_order,
        is_primary
      )
      `,
    { count: "exact" },
  );
};
