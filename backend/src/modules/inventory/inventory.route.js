const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const inventoryController = require('./inventory.controller');
const {
  inventoryQuerySchema,
  productIdSchema,
  quantityActionSchema
} = require('./inventory.validation');

const router = express.Router();

router.use(authMiddleware, roleMiddleware(ROLES.ADMIN, ROLES.STAFF));

router.get('/', validateMiddleware(inventoryQuerySchema), inventoryController.getInventory);
router.get('/:productId', validateMiddleware(productIdSchema), inventoryController.getInventoryByProductId);
router.patch('/:productId/add', validateMiddleware(quantityActionSchema), inventoryController.addStock);
router.patch('/:productId/remove', validateMiddleware(quantityActionSchema), inventoryController.removeStock);
router.patch('/:productId/reserve', validateMiddleware(quantityActionSchema), inventoryController.reserveStock);
router.patch('/:productId/sold', validateMiddleware(quantityActionSchema), inventoryController.markSold);

module.exports = router;
