const AppError = require('../../common/exceptions/app-error');
const { getIO } = require('../../sockets');
const notificationRepository = require('./notification.repository');

async function getNotifications(userId) {
  return notificationRepository.findAllByUserId(userId);
}

async function getRecipients() {
  return notificationRepository.findAvailableRecipients();
}

async function createNotification(payload) {
  const io = getIO();
  let recipients = [];
  const activeRecipients = await notificationRepository.findAvailableRecipients();

  if (payload.audienceType === 'ALL') {
    recipients = activeRecipients;
  } else if (payload.audienceType === 'ROLE') {
    recipients = await notificationRepository.findRecipientsByRole(payload.roleName);
  } else {
    recipients = activeRecipients.filter((recipient) => recipient.userId === payload.userId);
  }

  if (!recipients.length) {
    throw new AppError('No active recipients found for this notification', 404);
  }

  const createdNotifications = [];

  for (const recipient of recipients) {
    const notification = await notificationRepository.create({
      userId: recipient.userId,
      title: payload.title,
      content: payload.content,
      type: payload.type
    });
    io.to(`notification:${recipient.userId}`).emit('new_notification', notification);
    createdNotifications.push(notification);
  }

  return {
    audienceType: payload.audienceType,
    roleName: payload.roleName || null,
    count: createdNotifications.length,
    notifications: createdNotifications
  };
}

async function markNotificationRead(userId, id, isRead) {
  const notification = await notificationRepository.findByIdAndUser(id, userId);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notificationRepository.markRead(id, userId, isRead);
}

async function markAllNotificationsRead(userId) {
  await notificationRepository.markAllRead(userId);
  return { updated: true };
}

module.exports = {
  getNotifications,
  getRecipients,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead
};
