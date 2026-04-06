const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const reviewService = require('./review.service');

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.id);
  return sendSuccess(res, 'Reviews fetched successfully', reviews);
});

const getReviewContext = asyncHandler(async (req, res) => {
  const context = await reviewService.getReviewContext(req.user, req.params.id);
  return sendSuccess(res, 'Review context fetched successfully', context);
});

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.params.id, req.body);
  return sendCreated(res, 'Review created successfully', review);
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.user, req.params.id, req.body);
  return sendSuccess(res, 'Review updated successfully', review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const result = await reviewService.deleteReview(req.user, req.params.id);
  return sendSuccess(res, 'Review deleted successfully', result);
});

module.exports = {
  getProductReviews,
  getReviewContext,
  createReview,
  updateReview,
  deleteReview
};
