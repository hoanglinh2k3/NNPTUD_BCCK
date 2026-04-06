const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const dashboardController = require('./dashboard.controller');
const { revenueQuerySchema } = require('./dashboard.validation');

const router = express.Router();

router.use(authMiddleware, roleMiddleware(ROLES.ADMIN, ROLES.STAFF));

router.get('/summary', dashboardController.getSummary);
router.get('/revenue', validateMiddleware(revenueQuerySchema), dashboardController.getRevenue);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/low-stock', dashboardController.getLowStock);

module.exports = router;
