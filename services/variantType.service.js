const supabase = require("../config/supabase");

const getAllVariantTypesData = async () => {
  const { data, error } = await supabase
    .from("variant_types")
    .select("*")
    .order("name");

  if (error) {
    throw new Error("Unable to fetch variant types.");
  }

  return data;
};

const getVariantTypeById = async (id) => {
  const { data, error } = await supabase
    .from("variant_types")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch variant type.");
  }

  return data;
};

const getVariantTypeByName = async (name) => {
  const { data, error } = await supabase
    .from("variant_types")
    .select("*")
    .ilike("name", name)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch variant type.");
  }

  return data;
};

const createVariantTypeRecord = async (variantTypeData) => {
  const { data, error } = await supabase
    .from("variant_types")
    .insert(variantTypeData)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to create variant type.");
  }

  return data;
};

const updateVariantTypeRecord = async (id, variantTypeData) => {
  const { data, error } = await supabase
    .from("variant_types")
    .update(variantTypeData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to update variant type.");
  }

  return data;
};

const deleteVariantTypeRecord = async (id) => {
  const { error } = await supabase.from("variant_types").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete variant type.");
  }
};

const getAllVariantTypes = async () => {
  return await getAllVariantTypesData();
};

const getVariantType = async (id) => {
  const variantType = await getVariantTypeById(id);

  if (!variantType) {
    throw new Error("Variant type not found.");
  }

  return variantType;
};

const createVariantType = async (variantTypeData) => {
  const existingVariantType = await getVariantTypeByName(variantTypeData.name);

  if (existingVariantType) {
    throw new Error("Variant type already exists.");
  }

  return await createVariantTypeRecord(variantTypeData);
};

const updateVariantType = async (id, variantTypeData) => {
  const variantType = await getVariantTypeById(id);

  if (!variantType) {
    throw new Error("Variant type not found.");
  }

  const existingVariantType = await getVariantTypeByName(variantTypeData.name);

  if (existingVariantType && existingVariantType.id !== id) {
    throw new Error("Variant type already exists.");
  }

  return await updateVariantTypeRecord(id, variantTypeData);
};

const deleteVariantType = async (id) => {
  const variantType = await getVariantTypeById(id);

  if (!variantType) {
    throw new Error("Variant type not found.");
  }

  await deleteVariantTypeRecord(id);
};

module.exports = {
  getAllVariantTypes,
  getVariantType,
  createVariantType,
  updateVariantType,
  deleteVariantType,
};
