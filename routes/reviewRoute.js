const express = require('express');

const {
  getReviews,
  createReview,
  updateReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('admin', 'user'), createReview);

router.route('/:id').patch(protect, authorize('admin', 'user'), updateReview);

module.exports = router;
