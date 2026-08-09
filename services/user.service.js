const supabase = require("../config/supabase");
const { hashPassword, comparePassword } = require("../utils/password");

const USER_PROFILE_SELECT = `
  id,
  first_name,
  last_name,
  email,
  phone,
  role,
  is_verified,
  is_active,
  created_at,
  updated_at
`;

const getUserById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select(USER_PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch user.");
  }

  return data;
};

const getUserWithPasswordById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch user.");
  }

  return data;
};

const updateUserById = async (id, payload) => {
  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", id)
    .select(USER_PROFILE_SELECT)
    .single();

  if (error) {
    throw new Error("Unable to update user.");
  }

  return data;
};

const getProfile = async (userId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

const updateProfile = async (userId, profileData) => {
  // Check user exists
  const existingUser = await getUserById(userId);

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // Only allow specific fields
  const updateData = {};

  if (profileData.first_name !== undefined) {
    updateData.first_name = profileData.first_name;
  }

  if (profileData.last_name !== undefined) {
    updateData.last_name = profileData.last_name;
  }

  if (profileData.phone !== undefined) {
    updateData.phone = profileData.phone;
  }

  const updatedUser = await updateUserById(userId, updateData);

  return updatedUser;
};

const changePassword = async (userId, { current_password, new_password }) => {
  const user = await getUserWithPasswordById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  const isPasswordCorrect = await comparePassword(
    current_password,
    user.password_hash,
  );

  if (!isPasswordCorrect) {
    throw new Error("Current password is incorrect.");
  }

  const password_hash = await hashPassword(new_password);

  await updateUserById(userId, {
    password_hash,
  });
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
