const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const categoryController = require('./category.controller');
const {
  categoryIdSchema,
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema
} = require('./category.validation');

const router = express.Router();

router.get('/', validateMiddleware(listCategoriesSchema), categoryController.getCategories);
router.get('/:id', validateMiddleware(categoryIdSchema), categoryController.getCategoryById);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(createCategorySchema),
  categoryController.createCategory
);
router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.STAFF),
  validateMiddleware(updateCategorySchema),
  categoryController.updateCategory
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validateMiddleware(categoryIdSchema),
  categoryController.deleteCategory
);

module.exports = router;
