const { z } = require('zod');
const { MESSAGE_TYPE_VALUES } = require('../../common/constants/message-type.constant');

const conversationUserSchema = {
  params: z.object({
    userId: z.coerce.number().int().positive()
  })
};

const messageIdSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

const createMessageSchema = {
  body: z.object({
    receiverId: z.coerce.number().int().positive(),
    content: z.string().optional().nullable(),
    messageType: z.enum(MESSAGE_TYPE_VALUES).optional()
  })
};

const markReadSchema = {
  params: messageIdSchema.params,
  body: z.object({
    isRead: z.boolean()
  })
};

module.exports = {
  conversationUserSchema,
  messageIdSchema,
  createMessageSchema,
  markReadSchema
};
