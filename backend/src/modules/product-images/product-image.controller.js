const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const productImageService = require('./product-image.service');

const getProductImages = asyncHandler(async (req, res) => {
  const images = await productImageService.getProductImages(req.params.id);
  return sendSuccess(res, 'Product images fetched successfully', images);
});

const uploadProductImages = asyncHandler(async (req, res) => {
  const images = await productImageService.uploadProductImages(req.params.id, req.files);
  return sendCreated(res, 'Product images uploaded successfully', images);
});

const setPrimaryImage = asyncHandler(async (req, res) => {
  const image = await productImageService.setPrimaryImage(req.params.id, req.body.isPrimary);
  return sendSuccess(res, 'Primary image updated successfully', image);
});

const deleteProductImage = asyncHandler(async (req, res) => {
  const result = await productImageService.deleteProductImage(req.params.id);
  return sendSuccess(res, 'Product image deleted successfully', result);
});

module.exports = {
  getProductImages,
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage
};
