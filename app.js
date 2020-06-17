const express = require('express');
const morgan = require('morgan');

const restaurantsRouter = require('./routes/restaurantsRoute');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Routers
app.use('/api/v1/restaurants', restaurantsRouter);

app.use((err, req, res, next) => {
  const error = { ...err };
  error.message = err.message;
  res.status(400).send(error);
});

module.exports = app;
