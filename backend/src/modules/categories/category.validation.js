const { z } = require('zod');

const categoryIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const listCategoriesSchema = {
  query: z.object({
    parentId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional()
  })
};

const createCategorySchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).optional().nullable(),
    parentId: z.coerce.number().int().positive().nullable().optional()
  })
};

const updateCategorySchema = {
  params: categoryIdSchema.params,
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(255).optional().nullable(),
    parentId: z.coerce.number().int().positive().nullable().optional()
  })
};

module.exports = {
  categoryIdSchema,
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema
};
