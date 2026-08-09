const supabase = require("../config/supabase");

const validateProductExists = async (productId) => {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify product.");
  }

  if (!data) {
    throw new Error("Product not found.");
  }

  return data;
};

const getAllProductVariantsData = async () => {
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
      *,
      products(
        id,
        name,
        slug
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to fetch product variants.");
  }

  return data;
};

const getProductVariantById = async (id) => {
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
      *,
      products(
        id,
        name,
        slug
      ),
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
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch product variant.");
  }

  return data;
};

const getProductVariantBySku = async (sku) => {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("sku", sku)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch product variant.");
  }

  return data;
};

const getProductVariantByBarcode = async (barcode) => {
  if (!barcode) return null;

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch product variant.");
  }

  return data;
};

const createProductVariantRecord = async (variantData) => {
  const { data, error } = await supabase
    .from("product_variants")
    .insert(variantData)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to create product variant.");
  }

  return data;
};

const updateProductVariantRecord = async (id, variantData) => {
  const { data, error } = await supabase
    .from("product_variants")
    .update(variantData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to update product variant.");
  }

  return data;
};

const deleteProductVariantRecord = async (id) => {
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error("Unable to delete product variant.");
  }
};

const getVariantValuesByIds = async (variantValueIds) => {
  const { data, error } = await supabase
    .from("variant_values")
    .select(
      `
      id,
      value_code,
      label,
      variant_type_id,
      variant_types (
        id,
        name
      )
    `,
    )
    .in("id", variantValueIds);

  if (error) {
    throw new Error("Unable to fetch variant values.");
  }

  return data;
};

const createVariantValueMappings = async (
  productVariantId,
  variantValueIds,
) => {
  const mappings = variantValueIds.map((variantValueId) => ({
    product_variant_id: productVariantId,
    variant_value_id: variantValueId,
  }));

  const { error } = await supabase
    .from("product_variant_values")
    .insert(mappings);

  if (error) {
    throw new Error("Unable to create variant mappings.");
  }
};

const deleteVariantValueMappings = async (productVariantId) => {
  const { error } = await supabase
    .from("product_variant_values")
    .delete()
    .eq("product_variant_id", productVariantId);

  if (error) {
    throw new Error("Unable to delete variant mappings.");
  }
};

const syncVariantValueMappings = async (productVariantId, variantValueIds) => {
  await deleteVariantValueMappings(productVariantId);

  if (variantValueIds.length === 0) {
    return;
  }

  await createVariantValueMappings(productVariantId, variantValueIds);
};

const validateSkuUniqueness = async (sku, currentVariantId = null) => {
  const existingVariant = await getProductVariantBySku(sku);

  if (existingVariant && existingVariant.id !== currentVariantId) {
    throw new Error("SKU already exists.");
  }
};

const validateBarcodeUniqueness = async (barcode, currentVariantId = null) => {
  if (!barcode) return;

  const existingVariant = await getProductVariantByBarcode(barcode);

  if (existingVariant && existingVariant.id !== currentVariantId) {
    throw new Error("Barcode already exists.");
  }
};

const validateVariantValues = async (variantValueIds) => {
  const uniqueIds = [...new Set(variantValueIds)];

  if (uniqueIds.length !== variantValueIds.length) {
    throw new Error("Duplicate variant values are not allowed.");
  }

  const variantValues = await getVariantValuesByIds(uniqueIds);

  if (variantValues.length !== uniqueIds.length) {
    throw new Error("One or more variant values do not exist.");
  }

  const variantTypeIds = variantValues.map((value) => value.variant_type_id);

  const uniqueVariantTypes = new Set(variantTypeIds);

  if (variantTypeIds.length !== uniqueVariantTypes.size) {
    throw new Error(
      "A product variant cannot contain multiple values from the same variant type.",
    );
  }

  return variantValues;
};

const getAllProductVariants = async () => {
  return await getAllProductVariantsData();
};

const getProductVariant = async (id) => {
  const productVariant = await getProductVariantById(id);

  if (!productVariant) {
    throw new Error("Product variant not found.");
  }

  return productVariant;
};

const createProductVariant = async (variantData) => {
  const {
    product_id,
    sku,
    barcode,
    price,
    compare_price,
    quantity,
    weight,
    track_inventory,
    is_active,
    variant_value_ids,
  } = variantData;

  // Validate business rules
  await validateProductExists(product_id);

  await validateSkuUniqueness(sku);

  await validateBarcodeUniqueness(barcode);

  await validateVariantValues(variant_value_ids);

  // Create variant
  const productVariant = await createProductVariantRecord({
    product_id,
    sku,
    barcode,
    price,
    compare_price,
    quantity,
    weight,
    track_inventory,
    is_active,
  });

  // Create mappings
  await createVariantValueMappings(productVariant.id, variant_value_ids);

  // Return complete object
  return await getProductVariantById(productVariant.id);
};

const updateProductVariant = async (id, variantData) => {
  const existingVariant = await getProductVariantById(id);

  if (!existingVariant) {
    throw new Error("Product variant not found.");
  }

  const {
    product_id = existingVariant.product_id,
    sku = existingVariant.sku,
    barcode = existingVariant.barcode,
    price = existingVariant.price,
    compare_price = existingVariant.compare_price,
    quantity = existingVariant.quantity,
    weight = existingVariant.weight,
    track_inventory = existingVariant.track_inventory,
    is_active = existingVariant.is_active,
    variant_value_ids,
  } = variantData;

  await validateProductExists(product_id);

  await validateSkuUniqueness(sku, id);

  await validateBarcodeUniqueness(barcode, id);

  if (variant_value_ids) {
    await validateVariantValues(variant_value_ids);
  }

  await updateProductVariantRecord(id, {
    product_id,
    sku,
    barcode,
    price,
    compare_price,
    quantity,
    weight,
    track_inventory,
    is_active,
  });

  if (variant_value_ids) {
    await syncVariantValueMappings(id, variant_value_ids);
  }

  return await getProductVariantById(id);
};

const deleteProductVariant = async (id) => {
  const existingVariant = await getProductVariantById(id);

  if (!existingVariant) {
    throw new Error("Product variant not found.");
  }

  await deleteProductVariantRecord(id);
};

module.exports = {
  getAllProductVariants,
  getProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
