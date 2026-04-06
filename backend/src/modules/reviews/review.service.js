const AppError = require('../../common/exceptions/app-error');
const { ROLES } = require('../../common/constants/roles.constant');
const reviewRepository = require('./review.repository');

async function getProductReviews(productId) {
  return reviewRepository.findByProductId(productId);
}

async function getReviewContext(currentUser, productId) {
  if (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.STAFF) {
    const reviews = await reviewRepository.findAllByProductId(productId);
    return {
      reviews,
      ownReview: null,
      hasPurchased: false,
      canReview: false
    };
  }

  const [reviews, ownReview, hasPurchased] = await Promise.all([
    reviewRepository.findByProductId(productId),
    reviewRepository.findByUserAndProduct(currentUser.id, productId),
    reviewRepository.hasPurchasedProduct(currentUser.id, productId)
  ]);

  return {
    reviews,
    ownReview,
    hasPurchased,
    canReview: Boolean(hasPurchased && !ownReview)
  };
}

async function createReview(userId, productId, payload) {
  const hasPurchased = await reviewRepository.hasPurchasedProduct(userId, productId);
  if (!hasPurchased) {
    throw new AppError('You can only review products you have purchased and received', 400);
  }

  const existingReview = await reviewRepository.findByUserAndProduct(userId, productId);
  if (existingReview) {
    throw new AppError('You have already reviewed this product', 409);
  }

  return reviewRepository.create(userId, productId, payload);
}

async function updateReview(currentUser, id, payload) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (currentUser.role !== 'Admin' && review.userId !== currentUser.id) {
    throw new AppError('Forbidden', 403);
  }

  return reviewRepository.update(id, {
    rating: payload.rating !== undefined ? payload.rating : review.rating,
    comment: payload.comment !== undefined ? payload.comment : review.comment,
    status:
      currentUser.role === 'Admin'
        ? payload.status || review.status
        : review.status
  });
}

async function deleteReview(currentUser, id) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (currentUser.role !== 'Admin' && review.userId !== currentUser.id) {
    throw new AppError('Forbidden', 403);
  }

  await reviewRepository.remove(id);
  return { deleted: true };
}

module.exports = {
  getProductReviews,
  getReviewContext,
  createReview,
  updateReview,
  deleteReview
};
