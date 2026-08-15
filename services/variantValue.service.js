/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");

const { getVariantType } = require("./variantType.service");

const getAllVariantValuesData = async () => {
  const { data, error } = await supabase
    .from("variant_values")
    .select(
      `
      *,
      variant_types (
        id,
        name
      )
    `,
    )
    .order("label");

  if (error) {
    throw new Error("Unable to fetch variant values.");
  }

  return data;
};

const getVariantValueById = async (id) => {
  const { data, error } = await supabase
    .from("variant_values")
    .select(
      `
      *,
      variant_types (
        id,
        name
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch variant value.");
  }

  return data;
};

const findVariantValue = async (filters) => {
  let query = supabase.from("variant_values").select("*");

  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Unable to fetch variant value.");
  }

  return data;
};

const createVariantValueRecord = async (variantValueData) => {
  const { data, error } = await supabase
    .from("variant_values")
    .insert(variantValueData)
    .select(
      `
      *,
      variant_types (
        id,
        name
      )
    `,
    )
    .single();

  if (error) {
    throw new Error("Unable to create variant value.");
  }

  return data;
};

const updateVariantValueRecord = async (id, variantValueData) => {
  const { data, error } = await supabase
    .from("variant_values")
    .update(variantValueData)
    .eq("id", id)
    .select(
      `
      *,
      variant_types (
        id,
        name
      )
    `,
    )
    .single();

  if (error) {
    throw new Error("Unable to update variant value.");
  }

  return data;
};

const deleteVariantValueRecord = async (id) => {
  const { error } = await supabase.from("variant_values").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete variant value.");
  }
};

const getAllVariantValues = async () => {
  return await getAllVariantValuesData();
};

const getVariantValue = async (id) => {
  const variantValue = await getVariantValueById(id);

  if (!variantValue) {
    throw new Error("Variant value not found.");
  }

  return variantValue;
};

const createVariantValue = async (variantValueData) => {
  await getVariantType(variantValueData.variant_type_id);

  const existingValue = await findVariantValue({
    variant_type_id: variantValueData.variant_type_id,
    value_code: variantValueData.value_code,
  });

  if (existingValue) {
    throw new Error("Variant value already exists.");
  }

  return await createVariantValueRecord(variantValueData);
};

const updateVariantValue = async (id, variantValueData) => {
  const variantValue = await getVariantValueById(id);

  if (!variantValue) {
    throw new Error("Variant value not found.");
  }

  await getVariantType(variantValueData.variant_type_id);

  const existingValue = await findVariantValue({
    variant_type_id: variantValueData.variant_type_id,
    value_code: variantValueData.value_code,
  });

  if (existingValue && existingValue.id !== id) {
    throw new Error("Variant value already exists.");
  }

  return await updateVariantValueRecord(id, variantValueData);
};

const deleteVariantValue = async (id) => {
  const variantValue = await getVariantValueById(id);

  if (!variantValue) {
    throw new Error("Variant value not found.");
  }

  await deleteVariantValueRecord(id);
};

module.exports = {
  getAllVariantValues,
  getVariantValue,
  createVariantValue,
  updateVariantValue,
  deleteVariantValue,
};
