const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { messageFileUpload } = require('../../middlewares/upload.middleware');
const messageController = require('./message.controller');
const {
  conversationUserSchema,
  createMessageSchema,
  markReadSchema
} = require('./message.validation');

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/support/contact', messageController.getSupportContact);
router.get('/:userId', validateMiddleware(conversationUserSchema), messageController.getChatHistory);
router.post(
  '/',
  messageFileUpload.single('file'),
  validateMiddleware(createMessageSchema),
  messageController.sendMessage
);
router.patch('/:id/read', validateMiddleware(markReadSchema), messageController.markMessageAsRead);

module.exports = router;
