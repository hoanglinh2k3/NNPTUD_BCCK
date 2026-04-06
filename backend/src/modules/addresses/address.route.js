const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const addressController = require('./address.controller');
const {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
  setDefaultSchema
} = require('./address.validation');

const router = express.Router();

router.use(authMiddleware, roleMiddleware(ROLES.CUSTOMER));

router.get('/', addressController.getAddresses);
router.get('/:id', validateMiddleware(addressIdSchema), addressController.getAddressById);
router.post('/', validateMiddleware(createAddressSchema), addressController.createAddress);
router.patch('/:id', validateMiddleware(updateAddressSchema), addressController.updateAddress);
router.patch('/:id/default', validateMiddleware(setDefaultSchema), addressController.setDefaultAddress);
router.delete('/:id', validateMiddleware(addressIdSchema), addressController.deleteAddress);

module.exports = router;
