/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const supabase = require("../config/supabase");

const getAllBrands = async () => {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  if (error) {
    throw new Error("Unable to fetch brands.");
  }

  return data;
};

const getBrandById = async (id) => {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Brand not found.");
  }

  return data;
};

const createBrand = async (brandData) => {
  const { data, error } = await supabase
    .from("brands")
    .insert(brandData)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to create brand.");
  }

  return data;
};

const updateBrand = async (id, brandData) => {
  const { data, error } = await supabase
    .from("brands")
    .update(brandData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("Unable to update brand.");
  }

  return data;
};

const deleteBrand = async (id) => {
  const { error } = await supabase.from("brands").delete().eq("id", id);

  if (error) {
    throw new Error("Unable to delete brand.");
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
