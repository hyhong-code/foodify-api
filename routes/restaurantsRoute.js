const express = require('express');

const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  topFiveCheapAlias,
  restaurantsStats,
} = require('../controllers/restaurantsController');

const { protect, authorize } = require('../controllers/authController');

const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:restaurantId/reviews', reviewRouter);

router.route('/top-five-cheap').get(topFiveCheapAlias, getRestaurants);
router.route('/stats').get(protect, authorize('admin'), restaurantsStats);

router
  .route('/')
  .get(getRestaurants)
  .post(protect, authorize('admin', 'owner'), createRestaurant);
router
  .route('/:id')
  .get(getRestaurant)
  .patch(protect, authorize('admin', 'owner'), updateRestaurant)
  .delete(protect, authorize('admin', 'owner'), deleteRestaurant);

module.exports = router;
