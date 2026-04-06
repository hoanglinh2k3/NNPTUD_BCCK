const { z } = require('zod');

const USER_STATUS = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

const userIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const listUsersSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    keyword: z.string().optional(),
    roleId: z.coerce.number().int().positive().optional(),
    status: z.enum(USER_STATUS).optional()
  })
};

const createUserSchema = {
  body: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email().max(100),
    password: z.string().min(8).max(100),
    phone: z.string().max(20).optional().or(z.literal('')),
    roleId: z.coerce.number().int().positive()
  })
};

const updateUserSchema = {
  params: userIdSchema.params,
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    email: z.string().email().max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    roleId: z.coerce.number().int().positive().optional(),
    status: z.enum(USER_STATUS).optional()
  })
};

const updateStatusSchema = {
  params: userIdSchema.params,
  body: z.object({
    status: z.enum(USER_STATUS)
  })
};

const updateProfileSchema = {
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional().nullable()
  })
};

module.exports = {
  userIdSchema,
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  updateProfileSchema
};
