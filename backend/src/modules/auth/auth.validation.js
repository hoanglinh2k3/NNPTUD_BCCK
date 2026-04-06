const { z } = require('zod');

const registerSchema = {
  body: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email().max(100),
    password: z.string().min(8).max(100),
    phone: z.string().max(20).optional().or(z.literal(''))
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100)
  })
};

const changePasswordSchema = {
  body: z.object({
    oldPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100)
  })
};

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema
};
