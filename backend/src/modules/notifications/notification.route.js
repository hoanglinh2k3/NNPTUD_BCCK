const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const notificationController = require('./notification.controller');
const {
  notificationIdSchema,
  createNotificationSchema,
  markReadSchema
} = require('./notification.validation');

const router = express.Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.get(
  '/recipients',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  notificationController.getRecipients
);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(createNotificationSchema),
  notificationController.createNotification
);
router.patch(
  '/:id/read',
  authMiddleware,
  validateMiddleware(markReadSchema),
  notificationController.markNotificationRead
);
router.patch('/read-all', authMiddleware, notificationController.markAllNotificationsRead);

module.exports = router;
