const { z } = require('zod');

const productIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const reviewIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const createReviewSchema = {
  params: productIdSchema.params,
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1000).optional().nullable()
  })
};

const updateReviewSchema = {
  params: reviewIdSchema.params,
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().max(1000).optional().nullable(),
    status: z.enum(['VISIBLE', 'HIDDEN']).optional()
  })
};

module.exports = {
  productIdSchema,
  reviewIdSchema,
  createReviewSchema,
  updateReviewSchema
};
