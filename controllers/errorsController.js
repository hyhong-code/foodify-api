const CustomError = require('../utils/customError');

// For development postman error logging
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    trace: err.stack,
  });
};

// For front end clients
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

// A global central error handler
const errorsController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name; // enumerable field

    // Handle Mongoose Object Id casting error
    if (error.name === 'CastError') {
      error = new CustomError(
        `Value ${error.value} is invalid for ${error.path} field`,
        400
      );
    }

    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      const message = Object.keys(error.keyValue)
        .map(
          (key) =>
            `Value ${error.keyValue[key]} for ${key} field is already taken`
        )
        .join(', ');
      error = new CustomError(message, 400);
    }

    // Handle Mongoose validation errors
    if (error.errors) {
      const message = Object.values(error.errors)
        .map((field) => field.properties.message)
        .join(', ');
      error = new CustomError(`Validation failed: ${message}`, 400);
    }
    sendErrorProd(error, res);
  } else {
    sendErrorDev(err, res);
  }
};

module.exports = errorsController;
