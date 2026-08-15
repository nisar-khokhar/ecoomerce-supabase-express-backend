/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");
const { generateAccessToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");

/**
 * ---------------------------------------
 * Public Services
 * ---------------------------------------
 */

/**
 * Register User
 */
const registerUser = async (userData) => {
  const { first_name, last_name, email, phone, password } = userData;

  // Check email
  //   const existingEmail = await getUserByEmail(email);

  // Check phone
  //   const existingPhone = await getUserByPhone(phone);

  // Since they are independent database queries, we can run them in parallel:

  const [existingEmail, existingPhone] = await Promise.all([
    getUserByEmail(email),
    getUserByPhone(phone),
  ]);

  if (existingEmail) {
    throw new Error("Email already exists.");
  }

  if (existingPhone) {
    throw new Error("Phone number already exists.");
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create user
  const { data, error } = await supabase
    .from("users")
    .insert({
      first_name,
      last_name,
      email,
      phone,
      password_hash,
    })
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      is_verified,
      is_active,
      created_at
      `,
    )
    .single();

  if (error) {
    throw new Error("Unable to register user.");
  }

  return data;
};

/**
 *
 * Login User
 */
const loginUser = async ({ email, password }) => {
  const user = await validateUserCredentials(email, password);

  return createAuthPayload(user);
};

module.exports = {
  registerUser,
  loginUser,
};

/**
 * ---------------------------------------
 * Private Helpers
 * ---------------------------------------
 */

/**
 * Find user by email
 */
const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify email.");
  }

  return data;
};

/**
 * Find user by phone
 */
const getUserByPhone = async (phone) => {
  if (!phone) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify phone number.");
  }

  return data;
};

const createAuthPayload = (user) => {
  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      is_active: user.is_active,
    },
    accessToken,
  };
};

const validateUserCredentials = async (email, password) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.is_active) {
    throw new Error("Your account has been deactivated.");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  return user;
};

/**
 * Imagine six months from now your project supports:

Email Login

Google Login

Facebook Login

GitHub Login

Refresh Token

Admin Impersonation

Every one of those ends with:

{
    "user": { ... },
    "accessToken": "..."
}

Without buildAuthResponse():
you would have to write the same code over and over again in each of those services. With buildAuthResponse(), you can just call it and get the same response structure every time.
 */
