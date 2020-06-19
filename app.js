const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const errorHander = require('./controllers/errorsController');
const CustomError = require('./utils/customError');

const restaurantsRouter = require('./routes/restaurantsRoute');
const authRouter = require('./routes/authRoute');
const reviewRouter = require('./routes/reviewRoute');

const app = express();

// Middlewares
app.use(helmet()); // Set secure http headers
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Dev logger
}
// Rate limiter
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'To many requests, try again later.',
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attack
// Prevent http params polution
app.use(
  hpp({
    whitelist: ['name', 'maxTableSize', 'affordability'],
  })
);
app.use(cookieParser());

// Routers
app.use('/api/v1/restaurants', restaurantsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new CustomError(`Route ${req.originalUrl} not found...`, 404));
});

// Error handler
app.use(errorHander);

module.exports = app;
