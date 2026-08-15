/*
 * Copyright (c) 2026 Malik Nisar Khokhar
 * Author: Malik Nisar Khokhar
 * Email: khokharmaliknisar@gmail.com
 * Project: Node Express CRUD
 * All rights reserved.
 */

const productService = require("../services/product.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    category,
    brand,
    search,
    featured,
    active,
    sort,
    order,
  } = req.query;

  const options = {
    pagination: {
      page,
      limit,
    },

    filters: {
      category,
      brand,
      search,
      featured,
      active,
    },

    sorting: {
      sort,
      order,
    },
  };

  const result = await productService.getAllProducts(options);

  return res.status(200).json({
    success: true,
    message: "Products fetched successfully.",
    data: result.products,
    pagination: result.pagination,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Product fetched successfully.",
    data: product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  return res.status(201).json({
    success: true,
    message: "Product created successfully.",
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: "Product updated successfully.",
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully.",
  });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
