const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const roleController = require('./role.controller');
const { createRoleSchema, updateRoleSchema, roleIdSchema } = require('./role.validation');

const router = express.Router();

router.use(authMiddleware, roleMiddleware(ROLES.ADMIN));

router.get('/', roleController.getRoles);
router.get('/:id', validateMiddleware(roleIdSchema), roleController.getRoleById);
router.post('/', validateMiddleware(createRoleSchema), roleController.createRole);
router.patch('/:id', validateMiddleware(updateRoleSchema), roleController.updateRole);
router.delete('/:id', validateMiddleware(roleIdSchema), roleController.deleteRole);

module.exports = router;
