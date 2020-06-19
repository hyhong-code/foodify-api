const express = require('express');

const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('admin', 'user'), createReview);

router.use(protect, authorize('admin', 'user'));
router.route('/:id').patch(updateReview).delete(deleteReview);

module.exports = router;
