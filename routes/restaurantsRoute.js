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

const router = express.Router();

router.route('/top-five-cheap').get(topFiveCheapAlias, getRestaurants);
router.route('/stats').get(restaurantsStats);

router.route('/').get(getRestaurants).post(createRestaurant);
router
  .route('/:id')
  .get(getRestaurant)
  .patch(updateRestaurant)
  .delete(deleteRestaurant);

module.exports = router;
