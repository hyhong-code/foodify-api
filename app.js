const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHander = require('./controllers/errorsController');
const CustomError = require('./utils/customError');

const restaurantsRouter = require('./routes/restaurantsRoute');
const authRouter = require('./routes/authRoute');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(cookieParser());

// Routers
app.use('/api/v1/restaurants', restaurantsRouter);
app.use('/api/v1/auth/', authRouter);

app.all('*', (req, res, next) => {
  next(new CustomError(`Route ${req.originalUrl} not found...`, 404));
});

// Error handler
app.use(errorHander);

module.exports = app;
