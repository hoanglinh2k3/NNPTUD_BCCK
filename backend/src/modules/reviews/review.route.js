const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const { ROLES } = require('../../common/constants/roles.constant');
const reviewController = require('./review.controller');
const {
  productIdSchema,
  reviewIdSchema,
  createReviewSchema,
  updateReviewSchema
} = require('./review.validation');

const router = express.Router();

router.get('/products/:id/reviews', validateMiddleware(productIdSchema), reviewController.getProductReviews);
router.get(
  '/products/:id/reviews/manage',
  authMiddleware,
  validateMiddleware(productIdSchema),
  reviewController.getReviewContext
);
router.post(
  '/products/:id/reviews',
  authMiddleware,
  roleMiddleware(ROLES.CUSTOMER),
  validateMiddleware(createReviewSchema),
  reviewController.createReview
);
router.patch('/reviews/:id', authMiddleware, validateMiddleware(updateReviewSchema), reviewController.updateReview);
router.delete('/reviews/:id', authMiddleware, validateMiddleware(reviewIdSchema), reviewController.deleteReview);

module.exports = router;
