const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const cartController = require('./cart.controller');
const { cartItemIdSchema, createCartItemSchema, updateCartItemSchema } = require('./cart.validation');

const router = express.Router();

router.use(authMiddleware, roleMiddleware(ROLES.CUSTOMER));

router.get('/', cartController.getCurrentCart);
router.post('/items', validateMiddleware(createCartItemSchema), cartController.addItem);
router.patch('/items/:id', validateMiddleware(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:id', validateMiddleware(cartItemIdSchema), cartController.removeItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
