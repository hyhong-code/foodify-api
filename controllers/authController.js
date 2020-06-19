const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Signs a jwt and responds with cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Generate a jwt
  const token = user.generateToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.status(statusCode).cookie('jwt', token, cookieOptions).json({
    status: 'success',
    token,
    data: { user },
  });
};

// @desc    Sign up a user
// @route   /api/v1/auth/signup
// @access  Public
exports.signUp = asyncHandler(async (req, res, next) => {
  // Create the user
  const user = await User.create(req.body);

  sendTokenResponse(user, 201, res);
});

// @desc    Login a user
// @route   /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.verifyPassword(password))) {
    return next(new CustomError(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

exports.loadMe = asyncHandler(async (req, res, next) => {});

// Verify if request has a valid Bearer token or cookie tooken
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Handle Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    // Handle Cookie token
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Handle no token
  if (!token) {
    next(new CustomError(`No token, access denied`, 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  // Handle password changed after token was issued
  if (user.pwChangedAt.getTime() / 1000 > decoded.iat) {
    next(new CustomError(`Password recently changed, please login again`, 401));
  }

  req.user = user;
  next();
});
