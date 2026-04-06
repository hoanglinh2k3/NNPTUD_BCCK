const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const notificationService = require('./notification.service');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user.id);
  return sendSuccess(res, 'Notifications fetched successfully', notifications);
});

const getRecipients = asyncHandler(async (_req, res) => {
  const recipients = await notificationService.getRecipients();
  return sendSuccess(res, 'Notification recipients fetched successfully', recipients);
});

const createNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  return sendCreated(res, 'Notification created successfully', notification);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(
    req.user.id,
    req.params.id,
    req.body.isRead
  );
  return sendSuccess(res, 'Notification updated successfully', notification);
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user.id);
  return sendSuccess(res, 'All notifications updated successfully', result);
});

module.exports = {
  getNotifications,
  getRecipients,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead
};
