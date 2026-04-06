const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const messageService = require('./message.service');

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getConversations(req.user.id);
  return sendSuccess(res, 'Conversations fetched successfully', conversations);
});

const getSupportContact = asyncHandler(async (req, res) => {
  const contact = await messageService.getSupportContact(req.user);
  return sendSuccess(res, 'Support contact fetched successfully', contact);
});

const getChatHistory = asyncHandler(async (req, res) => {
  const messages = await messageService.getChatHistory(req.user.id, req.params.userId);
  return sendSuccess(res, 'Messages fetched successfully', messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(req.user.id, req.body, req.file);
  return sendCreated(res, 'Message sent successfully', message);
});

const markMessageAsRead = asyncHandler(async (req, res) => {
  const message = await messageService.markMessageAsRead(req.user.id, req.params.id);
  return sendSuccess(res, 'Message marked as read', message);
});

module.exports = {
  getConversations,
  getSupportContact,
  getChatHistory,
  sendMessage,
  markMessageAsRead
};
