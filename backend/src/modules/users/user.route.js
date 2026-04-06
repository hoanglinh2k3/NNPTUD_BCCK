const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { avatarUpload } = require('../../middlewares/upload.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const userController = require('./user.controller');
const {
  userIdSchema,
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  updateProfileSchema
} = require('./user.validation');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validateMiddleware(listUsersSchema),
  userController.getUsers
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validateMiddleware(userIdSchema),
  userController.getUserById
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validateMiddleware(createUserSchema),
  userController.createUser
);

router.patch(
  '/profile',
  authMiddleware,
  validateMiddleware(updateProfileSchema),
  userController.updateProfile
);

router.post(
  '/avatar',
  authMiddleware,
  avatarUpload.single('avatar'),
  userController.uploadAvatar
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validateMiddleware(updateUserSchema),
  userController.updateUser
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validateMiddleware(updateStatusSchema),
  userController.updateUserStatus
);

module.exports = router;
