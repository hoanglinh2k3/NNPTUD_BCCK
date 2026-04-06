const AppError = require('../../common/exceptions/app-error');
const { buildFileUrl, getRelativeUploadPath } = require('../../common/utils/file.util');
const productImageRepository = require('./product-image.repository');

async function getProductImages(productId) {
  const product = await productImageRepository.findProductById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return productImageRepository.findByProductId(productId);
}

async function uploadProductImages(productId, files) {
  const product = await productImageRepository.findProductById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!files?.length) {
    throw new AppError('At least one image is required', 400);
  }

  const existingImages = await productImageRepository.findByProductId(productId);
  const images = files.map((file, index) => ({
    imageUrl: buildFileUrl(getRelativeUploadPath(file.path)),
    isPrimary: existingImages.length === 0 && index === 0,
    sortOrder: existingImages.length + index
  }));

  return productImageRepository.addMany(productId, images);
}

async function setPrimaryImage(id, isPrimary) {
  const image = await productImageRepository.findById(id);
  if (!image) {
    throw new AppError('Product image not found', 404);
  }

  if (isPrimary) {
    await productImageRepository.clearPrimary(image.productId);
  }

  return productImageRepository.setPrimary(id, image.productId, isPrimary);
}

async function deleteProductImage(id) {
  const image = await productImageRepository.findById(id);
  if (!image) {
    throw new AppError('Product image not found', 404);
  }

  await productImageRepository.remove(id);

  if (image.isPrimary) {
    const remainingImages = await productImageRepository.findByProductId(image.productId);
    if (remainingImages.length) {
      await productImageRepository.setPrimary(remainingImages[0].id, image.productId, true);
    }
  }

  return { deleted: true };
}

module.exports = {
  getProductImages,
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage
};
