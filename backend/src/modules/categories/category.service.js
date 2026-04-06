const AppError = require('../../common/exceptions/app-error');
const { normalizePagination, buildMeta } = require('../../common/helpers/pagination.helper');
const slugify = require('../../common/helpers/slugify.helper');
const categoryRepository = require('./category.repository');

async function getCategories(query) {
  const pagination = normalizePagination(query);
  const [categories, total] = await Promise.all([
    categoryRepository.findAll(query, pagination),
    categoryRepository.countAll(query)
  ]);

  return {
    data: categories,
    meta: buildMeta(pagination.page, pagination.limit, total)
  };
}

async function getCategoryById(id) {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
}

async function createCategory(payload) {
  const slug = slugify(payload.name);
  const existingCategory = await categoryRepository.findBySlug(slug);
  if (existingCategory) {
    throw new AppError('Category slug already exists', 409);
  }

  if (payload.parentId) {
    const parent = await categoryRepository.findById(payload.parentId);
    if (!parent) {
      throw new AppError('Parent category not found', 404);
    }
  }

  return categoryRepository.create({
    ...payload,
    slug
  });
}

async function updateCategory(id, payload) {
  const currentCategory = await categoryRepository.findById(id);
  if (!currentCategory) {
    throw new AppError('Category not found', 404);
  }

  const name = payload.name || currentCategory.name;
  const slug = slugify(name);

  if (slug !== currentCategory.slug) {
    const sameSlug = await categoryRepository.findBySlug(slug);
    if (sameSlug) {
      throw new AppError('Category slug already exists', 409);
    }
  }

  if (payload.parentId === id) {
    throw new AppError('Category cannot be its own parent', 400);
  }

  if (payload.parentId) {
    const parent = await categoryRepository.findById(payload.parentId);
    if (!parent) {
      throw new AppError('Parent category not found', 404);
    }
  }

  return categoryRepository.update(id, {
    name,
    slug,
    description: payload.description !== undefined ? payload.description : currentCategory.description,
    parentId: payload.parentId !== undefined ? payload.parentId : currentCategory.parentId
  });
}

async function deleteCategory(id) {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const [childrenCount, productsCount] = await Promise.all([
    categoryRepository.countChildren(id),
    categoryRepository.countProducts(id)
  ]);

  if (childrenCount > 0 || productsCount > 0) {
    throw new AppError('Cannot delete category that still has children or products', 409);
  }

  await categoryRepository.remove(id);
  return { deleted: true };
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
