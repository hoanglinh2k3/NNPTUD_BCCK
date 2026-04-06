const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const authController = require('./auth.controller');
const { registerSchema, loginSchema, changePasswordSchema } = require('./auth.validation');

const router = express.Router();

router.post('/register', validateMiddleware(registerSchema), authController.register);
router.post('/login', validateMiddleware(loginSchema), authController.login);
router.get('/profile', authMiddleware, authController.profile);
router.patch(
  '/change-password',
  authMiddleware,
  validateMiddleware(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
