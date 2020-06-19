const Restaurant = require('../models/Restaurant');
const CustomError = require('../utils/customError');
const QueryFeatures = require('../utils/queryFeatures');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
  const query = Restaurant.find();
  const restaurants = await new QueryFeatures(query, req.query)
    .filter()
    .select()
    .sort()
    .paginate()
    .query.populate({ path: 'reviews', select: 'name review rating' });

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
  const restaurant = await Restaurant.findById(req.params.id).populate({
    path: 'reviews',
    select: 'name review rating',
  });

  // Check if restaurant exists
  if (!restaurant) {
    return next(
      new CustomError(`No such restaurant with id ${req.params.id}`, 404)
    );
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
    return next(
      new CustomError(`No such restaurant with id ${req.params.id}`, 404)
    );
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
    return next(
      new CustomError(`No such restaurant with id ${req.params.id}`, 404)
    );
  }

  await restaurant.remove();

  res.status(204).json({ status: 'success', data: null });
});

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
// @reoute  GET /api/v1/restaurants-within/:distance/center/:latlng/unit/:unit
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
