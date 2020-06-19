const asyncHandler = require('../utils/asyncHandler.js');
const CustomError = require('../utils/customError');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/restaurants/:restaurantId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  // Handle get reviews by restaurant
  const filter = {};
  if (req.params.restaurantId) {
    filter.restaurant = req.params.restaurantId;
  }

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    length: reviews.length,
    data: { reviews },
  });
});

// @desc    Post a review
// @route   POST /api/v1/restaurants/:restaurantId/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);

  // Check if restaurant exists
  if (!restaurant) {
    return next(
      new CustomError(`Restaurant id ${req.params.restaurantId} not found`, 404)
    );
  }
  // Attach user and restaurant on req body to be created
  req.body.user = req.user.id;
  req.body.restaurant = restaurant._id;

  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { review },
  });
});
