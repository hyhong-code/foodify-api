const asyncHandler = require('../utils/asyncHandler.js');
const CustomError = require('../utils/customError');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const QueryFeatures = require('../utils/queryFeatures');

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

  const query = Review.find(filter);
  const reviews = await new QueryFeatures(query, req.query)
    .filter()
    .select()
    .sort()
    .paginate().query;

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

// @desc    Update a review
// @route   PATCH /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  // Check if review exists
  if (!review) {
    return next(new CustomError(`Review id ${req.params.id} not found`, 404));
  }

  console.log(req.user.id, review.user._id.toString());

  // Check if user own the review
  if (req.user.id !== review.user._id.toString()) {
    return next(new CustomError(`User not authorized`, 401));
  }

  // Update the review
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

// @desc    Delate a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  // Check if review exists
  if (!review) {
    return next(new CustomError(`Review id ${req.params.id} not found`, 404));
  }

  // Check if user own the review
  if (req.user.id !== review.user._id.toString()) {
    return next(new CustomError(`User not authorized`, 401));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
