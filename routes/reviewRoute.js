const express = require('express');

const { getReviews, createReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('admin', 'user'), createReview);

module.exports = router;
