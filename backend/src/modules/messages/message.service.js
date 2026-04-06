const AppError = require('../../common/exceptions/app-error');
const { MESSAGE_TYPE } = require('../../common/constants/message-type.constant');
const { buildFileUrl, getRelativeUploadPath } = require('../../common/utils/file.util');
const { getIO } = require('../../sockets');
const messageRepository = require('./message.repository');

async function getConversations(userId) {
  return messageRepository.findConversations(userId);
}

async function getSupportContact(currentUser) {
  if (currentUser.role !== 'Customer') {
    return null;
  }

  return messageRepository.findSupportContact(currentUser.id);
}

async function getChatHistory(currentUserId, otherUserId) {
  const otherUser = await messageRepository.findUserById(otherUserId);
  if (!otherUser) {
    throw new AppError('Conversation user not found', 404);
  }

  return messageRepository.findMessagesBetweenUsers(currentUserId, otherUserId);
}

async function sendMessage(senderId, payload, file) {
  const receiver = await messageRepository.findUserById(payload.receiverId);
  if (!receiver) {
    throw new AppError('Receiver not found', 404);
  }

  let messageType = payload.messageType || MESSAGE_TYPE.TEXT;
  let fileUrl = null;
  let content = payload.content || null;

  if (file) {
    fileUrl = buildFileUrl(getRelativeUploadPath(file.path));
    messageType = file.mimetype.startsWith('image/') ? MESSAGE_TYPE.IMAGE : MESSAGE_TYPE.FILE;
    if (!content) {
      content = file.originalname;
    }
  }

  if (!content && !fileUrl) {
    throw new AppError('Message content or file is required', 400);
  }

  const message = await messageRepository.create({
    senderId,
    receiverId: payload.receiverId,
    content,
    messageType,
    fileUrl
  });

  const io = getIO();
  io.to(`user:${payload.receiverId}`).emit('receive_message', message);

  return message;
}

async function markMessageAsRead(currentUserId, messageId) {
  const message = await messageRepository.findById(messageId);
  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.receiverId !== currentUserId) {
    throw new AppError('Forbidden', 403);
  }

  const updatedMessage = await messageRepository.markAsRead(messageId);
  const io = getIO();
  io.to(`user:${message.senderId}`).emit('mark_as_read', {
    messageId: updatedMessage.id,
    senderId: message.senderId,
    receiverId: currentUserId,
    isRead: true
  });

  return updatedMessage;
}

module.exports = {
  getConversations,
  getSupportContact,
  getChatHistory,
  sendMessage,
  markMessageAsRead
};
