const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const paymentController = require('./payment.controller');
const {
  orderIdSchema,
  createPaymentSchema,
  updatePaymentStatusSchema
} = require('./payment.validation');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(createPaymentSchema),
  paymentController.createPayment
);
router.get(
  '/:orderId',
  authMiddleware,
  validateMiddleware(orderIdSchema),
  paymentController.getPaymentByOrderId
);
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(updatePaymentStatusSchema),
  paymentController.updatePaymentStatus
);

module.exports = router;
