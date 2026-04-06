const { z } = require('zod');

const addressIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const createAddressSchema = {
  body: z.object({
    receiverName: z.string().min(2).max(100),
    phone: z.string().min(8).max(20),
    province: z.string().max(100).optional().nullable(),
    district: z.string().max(100).optional().nullable(),
    ward: z.string().max(100).optional().nullable(),
    detailAddress: z.string().max(255).optional().nullable(),
    isDefault: z.boolean().optional()
  })
};

const updateAddressSchema = {
  params: addressIdSchema.params,
  body: createAddressSchema.body.partial()
};

const setDefaultSchema = {
  params: addressIdSchema.params,
  body: z.object({
    isDefault: z.boolean()
  })
};

module.exports = {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
  setDefaultSchema
};
