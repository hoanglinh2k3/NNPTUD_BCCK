const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const orderController = require('./order.controller');
const {
  orderIdSchema,
  checkoutSchema,
  listOrdersSchema,
  updateOrderStatusSchema
} = require('./order.validation');

const router = express.Router();

router.post(
  '/checkout',
  authMiddleware,
  roleMiddleware(ROLES.CUSTOMER),
  validateMiddleware(checkoutSchema),
  orderController.checkout
);

router.get('/', authMiddleware, validateMiddleware(listOrdersSchema), orderController.getOrders);
router.get('/:id', authMiddleware, validateMiddleware(orderIdSchema), orderController.getOrderById);
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(updateOrderStatusSchema),
  orderController.updateOrderStatus
);
router.patch('/:id/cancel', authMiddleware, validateMiddleware(orderIdSchema), orderController.cancelOrder);

module.exports = router;
