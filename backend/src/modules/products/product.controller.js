const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const productService = require('./product.service');

const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  return sendSuccess(res, 'Products fetched successfully', result.data, result.meta);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, 'Product fetched successfully', product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return sendCreated(res, 'Product created successfully', product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return sendSuccess(res, 'Product updated successfully', product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  return sendSuccess(res, 'Product deleted successfully', product);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
