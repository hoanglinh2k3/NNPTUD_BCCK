const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { productImagesUpload } = require('../../middlewares/upload.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const productImageController = require('./product-image.controller');
const { productIdSchema, imageIdSchema, setPrimarySchema } = require('./product-image.validation');

const router = express.Router();

router.get('/products/:id/images', validateMiddleware(productIdSchema), productImageController.getProductImages);
router.post(
  '/products/:id/images',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(productIdSchema),
  productImagesUpload.array('images', 10),
  productImageController.uploadProductImages
);
router.patch(
  '/product-images/:id/primary',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(setPrimarySchema),
  productImageController.setPrimaryImage
);
router.delete(
  '/product-images/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(imageIdSchema),
  productImageController.deleteProductImage
);

module.exports = router;
