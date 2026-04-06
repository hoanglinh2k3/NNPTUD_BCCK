const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const productController = require('./product.controller');
const {
  productIdSchema,
  listProductsSchema,
  createProductSchema,
  updateProductSchema
} = require('./product.validation');

const router = express.Router();

router.get('/', validateMiddleware(listProductsSchema), productController.getProducts);
router.get('/:id', validateMiddleware(productIdSchema), productController.getProductById);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(createProductSchema),
  productController.createProduct
);
router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(updateProductSchema),
  productController.updateProduct
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validateMiddleware(productIdSchema),
  productController.deleteProduct
);

module.exports = router;
