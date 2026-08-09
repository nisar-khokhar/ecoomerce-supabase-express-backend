const {
  applyProductFilters,
  applySorting,
  applyPagination,
} = require("../helpers/productQueryBuilder");
const supabase = require("../config/supabase");
const { formatProduct } = require("../utils/productFormatter");
const { createProductVariant } = require("./productVariant.service");

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

  const formattedProducts = data.map((data) => formatProduct(data));

  return {
    products: formattedProducts,
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

  return formatProduct(product);
};

const createProductRecord = async (productData) => {
  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) {
    // in development, we can log the error for debugging purposes
    console.error("Error creating product:", error);
    throw new Error("Unable to create product.");
  }

  return data;
};

// TODO:
// Wrap product creation, variant creation, and image creation
// in a PostgreSQL transaction (RPC) to ensure atomicity.

const createProduct = async (productData) => {
  const { variants, ...productFields } = productData;

  // Create product
  const product = await createProductRecord(productFields);

  // Create every variant
  await Promise.all(
    variants.map((variant) =>
      createProductVariant({
        ...variant,
        product_id: product.id,
      }),
    ),
  );

  // Fetch complete product
  const createdProduct = await getProductById(product.id);

  return formatProduct(createdProduct);
};

const updateProductRecord = async (id, productData) => {
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

const updateProduct = async (id, productData) => {
  // Ensure product exists
  await getProduct(id);

  // Update only product fields
  await updateProductRecord(id, productData);

  // Fetch complete updated product
  const updatedProduct = await getProductById(id);

  return formatProduct(updatedProduct);
};

const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete product.");
  }
};

const validateProductAvailability = async (productId) => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      price,
      quantity,
      is_active
      `,
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch product.");
  }

  if (!data) {
    throw new Error("Product not found.");
  }

  if (!data.is_active) {
    throw new Error("Product is unavailable.");
  }

  return data;
};

const validateProductIsActive = async (productId) => {
  const { data, error } = await supabase
    .from("products")
    .select("id, is_active")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch product.");
  }

  if (!data) {
    throw new Error("Product not found.");
  }

  if (!data.is_active) {
    throw new Error("Product is unavailable.");
  }

  return data;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  // Shared helper
  validateProductAvailability,
  validateProductIsActive,
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
      brands(id, name, slug),
      product_variants(
        id,
        sku,
        barcode,
        price,
        compare_price,
        quantity,
        weight,
        track_inventory,
        is_active,

        product_variant_values(
          variant_values(
            id,
            value_code,
            label,
            variant_types(
              id,
              name
            )
          )
        )
      )
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
      categories(
        id,
        name,
        slug
      ),
      brands(
        id,
        name,
        slug
      ),
      product_images(
        id,
        image_path,
        alt_text,
        sort_order,
        is_primary
      ),
      product_variants(
        id,
        sku,
        barcode,
        price,
        compare_price,
        quantity,
        weight,
        track_inventory,
        is_active,

        product_variant_values(
          variant_values(
            id,
            value_code,
            label,

            variant_types(
              id,
              name
            )
          )
        )
      )
    `,
    { count: "exact" },
  );
};
