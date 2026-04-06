const { z } = require('zod');
const { ROLES } = require('../../common/constants/roles.constant');

const notificationIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const createNotificationSchema = {
  body: z.object({
    audienceType: z.enum(['USER', 'ROLE', 'ALL']).default('USER'),
    userId: z.coerce.number().int().positive().optional(),
    roleName: z.enum([ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]).optional(),
    title: z.string().min(2).max(150),
    content: z.string().max(255).optional().nullable(),
    type: z.string().max(30).optional().nullable()
  }).superRefine((value, context) => {
    if (value.audienceType === 'USER' && !value.userId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userId'],
        message: 'userId is required when audienceType is USER'
      });
    }

    if (value.audienceType === 'ROLE' && !value.roleName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['roleName'],
        message: 'roleName is required when audienceType is ROLE'
      });
    }
  })
};

const markReadSchema = {
  params: notificationIdSchema.params,
  body: z.object({
    isRead: z.boolean()
  })
};

module.exports = {
  notificationIdSchema,
  createNotificationSchema,
  markReadSchema
};
