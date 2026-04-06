const { z } = require('zod');

const cartItemIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const createCartItemSchema = {
  body: z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive()
  })
};

const updateCartItemSchema = {
  params: cartItemIdSchema.params,
  body: z.object({
    quantity: z.coerce.number().int().positive()
  })
};

module.exports = {
  cartItemIdSchema,
  createCartItemSchema,
  updateCartItemSchema
};
