const express = require('express');

const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantsController');

const router = express.Router();

router.route('/').get(getRestaurants).post(createRestaurant);
router
  .route('/:id')
  .get(getRestaurant)
  .patch(updateRestaurant)
  .delete(deleteRestaurant);

module.exports = router;
