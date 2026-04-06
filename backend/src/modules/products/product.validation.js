const { z } = require('zod');

const PRODUCT_STATUS = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'];
const PRODUCT_SORT = ['latest', 'priceAsc', 'priceDesc', 'bestSelling'];

const productIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const listProductsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    keyword: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(PRODUCT_SORT).optional(),
    status: z.enum(PRODUCT_STATUS).optional(),
    material: z.string().optional(),
    color: z.string().optional()
  })
};

const createProductSchema = {
  body: z.object({
    name: z.string().min(2).max(150),
    categoryId: z.coerce.number().int().positive(),
    sku: z.string().min(2).max(50),
    description: z.string().optional().nullable(),
    price: z.coerce.number().positive(),
    discountPrice: z.coerce.number().nonnegative().nullable().optional(),
    material: z.string().max(100).optional().nullable(),
    color: z.string().max(100).optional().nullable(),
    size: z.string().max(100).optional().nullable(),
    collectionName: z.string().max(100).optional().nullable(),
    status: z.enum(PRODUCT_STATUS).optional()
  })
};

const updateProductSchema = {
  params: productIdSchema.params,
  body: createProductSchema.body.partial()
};

module.exports = {
  productIdSchema,
  listProductsSchema,
  createProductSchema,
  updateProductSchema
};
