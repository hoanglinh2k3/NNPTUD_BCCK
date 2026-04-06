const AppError = require('../../common/exceptions/app-error');
const { normalizePagination, buildMeta } = require('../../common/helpers/pagination.helper');
const slugify = require('../../common/helpers/slugify.helper');
const productRepository = require('./product.repository');

async function getProducts(query) {
  const pagination = normalizePagination(query);
  const [products, total] = await Promise.all([
    productRepository.findAll(query, pagination),
    productRepository.countAll(query)
  ]);

  return {
    data: products,
    meta: buildMeta(pagination.page, pagination.limit, total)
  };
}

async function getProductById(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const images = await productRepository.findImages(id);
  return {
    ...product,
    images
  };
}

async function createProduct(payload) {
  const category = await productRepository.findCategoryById(payload.categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const existingSku = await productRepository.findBySku(payload.sku);
  if (existingSku) {
    throw new AppError('SKU already exists', 409);
  }

  const slug = slugify(payload.name);
  const sameSlug = await productRepository.findBySlug(slug);
  if (sameSlug) {
    throw new AppError('Product slug already exists', 409);
  }

  return productRepository.create({
    ...payload,
    slug
  });
}

async function updateProduct(id, payload) {
  const currentProduct = await productRepository.findById(id);
  if (!currentProduct) {
    throw new AppError('Product not found', 404);
  }

  const categoryId = payload.categoryId || currentProduct.categoryId;
  const category = await productRepository.findCategoryById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const sku = payload.sku || currentProduct.sku;
  if (sku !== currentProduct.sku) {
    const existingSku = await productRepository.findBySku(sku);
    if (existingSku) {
      throw new AppError('SKU already exists', 409);
    }
  }

  const name = payload.name || currentProduct.name;
  const slug = slugify(name);
  if (slug !== currentProduct.slug) {
    const sameSlug = await productRepository.findBySlug(slug);
    if (sameSlug) {
      throw new AppError('Product slug already exists', 409);
    }
  }

  return productRepository.update(id, {
    categoryId,
    name,
    slug,
    description: payload.description !== undefined ? payload.description : currentProduct.description,
    price: payload.price !== undefined ? payload.price : currentProduct.price,
    discountPrice: payload.discountPrice !== undefined ? payload.discountPrice : currentProduct.discountPrice,
    sku,
    material: payload.material !== undefined ? payload.material : currentProduct.material,
    color: payload.color !== undefined ? payload.color : currentProduct.color,
    size: payload.size !== undefined ? payload.size : currentProduct.size,
    collectionName:
      payload.collectionName !== undefined ? payload.collectionName : currentProduct.collectionName,
    status: payload.status || currentProduct.status
  });
}

async function deleteProduct(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return productRepository.softDelete(id);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
