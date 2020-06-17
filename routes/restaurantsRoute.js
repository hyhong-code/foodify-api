const express = require('express');

const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  topFiveCheapAlias,
} = require('../controllers/restaurantsController');

const router = express.Router();

router.route('/topfivecheap').get(topFiveCheapAlias, getRestaurants);

router.route('/').get(getRestaurants).post(createRestaurant);
router
  .route('/:id')
  .get(getRestaurant)
  .patch(updateRestaurant)
  .delete(deleteRestaurant);

module.exports = router;
