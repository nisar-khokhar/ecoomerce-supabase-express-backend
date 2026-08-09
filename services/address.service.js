const supabase = require("../config/supabase");

const ADDRESS_SELECT = `
    id,
    user_id,
    label,
    recipient_name,
    phone,
    address_line_1,
    address_line_2,
    city,
    province,
    postal_code,
    country_code,
    delivery_notes,
    is_default,
    created_at,
    updated_at
`;

const getAddressById = async (id) => {
  const { data, error } = await supabase
    .from("user_addresses")
    .select(ADDRESS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch address.");
  }

  return data;
};

const getUserAddresses = async (userId) => {
  const { data, error } = await supabase
    .from("user_addresses")
    .select(ADDRESS_SELECT)
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to fetch addresses.");
  }

  return data;
};

const updateAddressById = async (id, payload) => {
  const { data, error } = await supabase
    .from("user_addresses")
    .update(payload)
    .eq("id", id)
    .select(ADDRESS_SELECT)
    .single();

  if (error) {
    throw new Error("Unable to update address.");
  }

  return data;
};

const deleteAddressById = async (id) => {
  const { error } = await supabase.from("user_addresses").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete address.");
  }
};

const clearDefaultAddress = async (userId) => {
  const { error } = await supabase
    .from("user_addresses")
    .update({
      is_default: false,
    })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (error) {
    throw new Error("Unable to update default address.");
  }
};

/**
 *
 * Public Services
 */

const getAddresses = async (userId) => {
  return await getUserAddresses(userId);
};

const getAddress = async (userId, addressId) => {
  const address = await getAddressById(addressId);

  if (!address || address.user_id !== userId) {
    throw new Error("Address not found.");
  }

  return address;
};

const createUserAddress = async (userId, addressData) => {
  // Check if this is the user's first address
  const existingAddresses = await getUserAddresses(userId);

  if (existingAddresses.length === 0) {
    addressData.is_default = true;
  }

  // If user explicitly selected this as default,
  // remove the previous default first
  if (addressData.is_default) {
    await clearDefaultAddress(userId);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({
      user_id: userId,
      ...addressData,
    })
    .select(ADDRESS_SELECT)
    .single();

  if (error) {
    throw new Error("Unable to create address.");
  }

  return data;
};

const updateUserAddress = async (userId, addressId, updateData) => {
  const address = await getAddress(userId, addressId);

  if (updateData.is_default) {
    await clearDefaultAddress(userId);
  }

  return await updateAddressById(address.id, updateData);
};

const deleteUserAddress = async (userId, addressId) => {
  // Verify address belongs to the user
  const address = await getAddress(userId, addressId);

  const wasDefault = address.is_default;

  // Delete the address
  await deleteAddressById(address.id);

  // If it wasn't the default, we're done
  if (!wasDefault) {
    return;
  }

  // Fetch remaining addresses
  const remainingAddresses = await getUserAddresses(userId);

  // No addresses left
  if (remainingAddresses.length === 0) {
    return;
  }

  // Make the first remaining address the default
  await updateAddressById(remainingAddresses[0].id, {
    is_default: true,
  });
};

const setDefaultAddress = async (userId, addressId) => {
  const address = await getAddress(userId, addressId);

  await clearDefaultAddress(userId);

  return await updateAddressById(address.id, {
    is_default: true,
  });
};

module.exports = {
  getAddresses,
  getAddress,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
};
