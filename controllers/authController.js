const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

// Returns a new obejct with unwanted fields removed
const filterReqBody = (reqBody, ...fieldsToExclude) => {
  const filteredBody = { ...reqBody };
  Object.keys(filteredBody).forEach((key) => {
    if (!fieldsToExclude.includes(key)) delete filteredBody[key];
  });
  return filteredBody;
};

// @desc    Sign up a user
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signUp = asyncHandler(async (req, res, next) => {
  // Create the user
  const user = await User.create(req.body);

  sendTokenResponse(user, 201, res);
});

// @desc    Login a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.verifyPassword(password))) {
    return next(new CustomError(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Load logged in user info
// @route   GET /api/v1/auth/loadme
// @access  Private
exports.loadMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});

// @desc    Update user name or email
// @route   PATCH /api/v1/auth/updateinfo
// @access  Private
exports.updateInfo = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    filterReqBody(req.body, 'name', 'email'),
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// @desc    Update user password
// @route   PATCH /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  // Check if required fields exists
  if (!(currentPassword && newPassword && newPasswordConfirm)) {
    return next(
      new CustomError(
        `currentPassword, newPassword and newPasswordConfirm are required`,
        400
      )
    );
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check if current password correct
  if (!(await user.verifyPassword(currentPassword))) {
    return next(new CustomError(`Current password is incorrect`, 400));
  }

  // Update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save({ validateBeforeSave: true });

  sendTokenResponse(user, 200, res);
});

// @desc    Request password reset token
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Check if email is send
  if (!email) {
    return next(new CustomError(`Email is required`, 400));
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new CustomError(`No user found with email ${email}`, 404));
  }

  // Get a reset token
  const token = await user.generateResetToken();

  // Construct email
  const emailOptions = {
    to: user.email,
    subject: `Password reset token, expires in 10 minutes`,
    text: `To reset password, please send a PATCH request to ${
      req.protocol
    }://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${token}\nIgnore this email if you did not request it.`,
  };

  // Send email
  try {
    await sendEmail(emailOptions);
  } catch (error) {
    user.pwResetTokenExpires = undefined;
    user.pwResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new CustomError(`Error sending email, try again later`, 500));
  }

  res.status(200).json({
    status: 'success',
    data: { message: 'Reset token send via email.' },
  });
});

// @desc    Reset password
// @route   PATCH /api/v1/auth/resetpassword:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Rehash token
  const pwResetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({ pwResetToken });

  // Check if user exists
  if (!user) {
    return next(new CustomError(`Invalid reset token`, 400));
  }

  // Check if token expired
  if (user.pwResetTokenExpires < Date.now()) {
    return next(new CustomError(`Reset token expired`, 400));
  }

  // Reset password
  const { password, passwordConfirm } = req.body;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.pwResetToken = undefined;
  user.pwResetTokenExpires = undefined;
  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    data: { message: 'Password successfully reset' },
  });
});

// Authenticate via valid Bearer token or cookie token
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
  if (user.checkPwChangedDate(decoded.iat)) {
    next(new CustomError(`Password recently changed, please login again`, 401));
  }

  req.user = user;
  next();
});

const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          `User role ${req.user.role} not authorized to access this route`,
          403
        )
      );
    }
    next();
  });
