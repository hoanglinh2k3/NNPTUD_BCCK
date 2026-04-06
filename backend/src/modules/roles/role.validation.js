const { z } = require('zod');

const idParams = z.object({
  id: z.coerce.number().int().positive()
});

const createRoleSchema = {
  body: z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(255).optional().nullable()
  })
};

const updateRoleSchema = {
  params: idParams,
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().max(255).optional().nullable()
  })
};

const roleIdSchema = {
  params: idParams
};

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  roleIdSchema
};
