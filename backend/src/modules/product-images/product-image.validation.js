const { z } = require('zod');

const productIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const imageIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const setPrimarySchema = {
  params: imageIdSchema.params,
  body: z.object({
    isPrimary: z.boolean()
  })
};

module.exports = {
  productIdSchema,
  imageIdSchema,
  setPrimarySchema
};
