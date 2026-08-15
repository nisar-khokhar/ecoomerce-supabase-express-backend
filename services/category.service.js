/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");

const getAllCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Unable to fetch categories.");
  }

  return data;
};

const getCategoryById = async (id) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Category not found.");
  }

  return data;
};

const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from("categories")
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to create category.");
  }

  return data;
};

const updateCategory = async (id, categoryData) => {
  const { data, error } = await supabase
    .from("categories")
    .update(categoryData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to update category.");
  }

  return data;
};

const deleteCategory = async (id) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete category.");
  }

  return;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
