const Restaurant = require('../models/Restaurant');
const CustomError = require('../utils/customError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
  const restaurants = await Restaurant.find();
  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: { restaurants },
  });
});

// @desc    Get a restaurant
// @route   GET /api/v1/restaurants:id
// @access  Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  // Check if restaurant exists
  if (!restaurant) {
    return next(new CustomError(`No such restaurant with id ${req.params.id}`));
  }

  res.status(200).json({
    status: 'success',
    data: { restaurant },
  });
});

// @desc    Add a restaurant
// @route   POST /api/v1/restaurants
// @access  Private
exports.createRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { restaurant },
  });
});

// @desc    Update a restaurant
// @route   PATCH /api/v1/restaurants:id
// @access  Private
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  // Check if restaurant exists
  if (!restaurant) {
    return next(new CustomError(`No such restaurant with id ${req.params.id}`));
  }

  res.status(200).json({
    status: 'success',
    data: { restaurant },
  });
});

// @desc    Delete a restaurant
// @route   DELETE /api/v1/restaurants:id
// @access  Private
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  // Check if restaurant exists
  if (!restaurant) {
    return next(new CustomError(`No such restaurant with id ${req.params.id}`));
  }

  await restaurant.remove();

  res.status(204).json({ status: 'success', data: null });
});
