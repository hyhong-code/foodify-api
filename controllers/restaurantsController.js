const Restaurant = require("../models/Restaurant");
const CustomError = require("../utils/customError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
  const restaurants = await Restaurant.find();
  res
    .status(200)
    .json({
      status: "success",
      results: restaurants.length,
      data: { restaurants },
    });
});
