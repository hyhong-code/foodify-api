const Restaurant = require('../models/Restaurant');
const CustomError = require('../utils/customError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
  console.log(req.query);

  let queryObj = { ...req.query };
  // Exclude query keywords
  const keywords = ['fields', 'sort', 'page', 'limit'];
  keywords.forEach((keyword) => delete queryObj[keyword]);

  // Extract and use query operators
  queryObj = JSON.parse(
    JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte|in)\b/g, (v) => `$${v}`)
  );

  let query = Restaurant.find(queryObj);

  // Select fields
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sort = req.query.sort.split(',').join(' ');
    query = query.sort(sort);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const restaurants = await query;
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
