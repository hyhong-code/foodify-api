const Restaurant = require('../models/Restaurant');
const CustomError = require('../utils/customError');
const asyncHandler = require('../utils/asyncHandler');
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require('./handlerFactory.js');

// @desc    Get restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = getAll(Restaurant, {
  path: 'reviews',
  select: 'name review rating',
});

// @desc    Get a restaurant
// @route   GET /api/v1/restaurants:id
// @access  Public
exports.getRestaurant = getOne(Restaurant, {
  path: 'reviews',
  select: 'name review rating',
});

// @desc    Add a restaurant
// @route   POST /api/v1/restaurants
// @access  Private
exports.createRestaurant = createOne(Restaurant);

// @desc    Update a restaurant
// @route   PATCH /api/v1/restaurants:id
// @access  Private
exports.updateRestaurant = updateOne(Restaurant);

// @desc    Delete a restaurant
// @route   DELETE /api/v1/restaurants:id
// @access  Private
exports.deleteRestaurant = deleteOne(Restaurant);

// @desc    Get top five rated cheap resturants
// @route   GET /api/v1/restaurants/top-five-cheap
// @access  Public
exports.topFiveCheapAlias = (req, res, next) => {
  req.query.sort = '-averageRating,averageDishPrice';
  req.query.limit = '5';
  next();
};

// @desc    Presend some restaurant stats by each affordability level
// @route   GET /api/v1/restaurants/stats
// @access  Private
exports.restaurantsStats = asyncHandler(async (req, res, next) => {
  const stats = await Restaurant.aggregate([
    { $match: { averageRating: { $gte: 1 } } },
    {
      $group: {
        _id: { $toUpper: '$affordability' },
        avgDishPrice: { $avg: '$averageDishPrice' },
        ratingsQty: { $sum: '$ratingsQty' },
        avgMaxTableSize: { $avg: '$maxTableSize' },
        names: { $push: '$name' },
        count: { $sum: 1 },
      },
    },
    { $addFields: { affordability: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { avgDishPrice: 1 } },
    { $limit: 3 },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: { stats },
  });
});

// @desc    Get Restaurants within distance
// @reoute  GET /api/v1/restaurants/restaurants-within/:distance/center/:latlng/unit/:unit
// @access  Public
exports.restaurantsWithin = asyncHandler(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Check if req params format correct
  if (!(lat && lng)) {
    return next(
      new CustomError(
        `Please provide latitute and longitude in the form of lat,lng`,
        400
      )
    );
  }

  // Calculate radius based on unit
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.15214;

  const restaurants = await Restaurant.find({
    mainLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: restaurants.length,
    data: { restaurants },
  });
});

// @desc    Calculate distance from a point to restaurants
// @reoute  GET /api/v1/restaurants/distances/:latlng/unit/:unit
// @access  Public
exports.getDistances = asyncHandler(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Check if req params format correct
  if (!(lat && lng)) {
    return next(
      new CustomError(
        `Please provide latitute and longitude in the form of lat,lng`,
        400
      )
    );
  }

  // Calculate distances
  const distanceMultiplier = unit === 'mi' ? 0.001 : 0.000621371;

  const distances = await Restaurant.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier,
      },
    },
    { $project: { name: 1, distance: 1, mainAddress: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { distances },
  });
});
