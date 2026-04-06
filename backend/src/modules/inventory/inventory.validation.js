const { z } = require('zod');

const inventoryQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    keyword: z.string().optional(),
    lowStock: z.coerce.number().int().positive().optional()
  })
};

const productIdSchema = {
  params: z.object({
    productId: z.coerce.number().int().positive()
  })
};

const quantityActionSchema = {
  params: productIdSchema.params,
  body: z.object({
    quantity: z.coerce.number().int().positive()
  })
};

module.exports = {
  inventoryQuerySchema,
  productIdSchema,
  quantityActionSchema
};
