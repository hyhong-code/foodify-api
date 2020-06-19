const CustomError = require('../utils/customError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// @desc    Sign up a user
// @route   /api/v1/auth/signup
// @access  Public
exports.signUp = asyncHandler(async (req, res, next) => {
  // Create the user
  const user = await User.create(req.body);

  // Generate a jwt
  const token = user.generateToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.status(201).cookie('jwt', token, cookieOptions).json({
    status: 'success',
    token,
    data: { user },
  });
});
