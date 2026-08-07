const brandService = require("../services/brand.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await brandService.getAllBrands();

  return res.status(200).json({
    success: true,
    message: "Brands fetched successfully.",
    data: brands,
  });
});

const getBrandById = asyncHandler(async (req, res) => {
  const brand = await brandService.getBrandById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Brand fetched successfully.",
    data: brand,
  });
});

const createBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.createBrand(req.body);

  return res.status(201).json({
    success: true,
    message: "Brand created successfully.",
    data: brand,
  });
});

const updateBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.updateBrand(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: "Brand updated successfully.",
    data: brand,
  });
});

const deleteBrand = asyncHandler(async (req, res) => {
  await brandService.deleteBrand(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Brand deleted successfully.",
  });
});

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
