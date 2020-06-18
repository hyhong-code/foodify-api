require('dotenv').config({ path: `${__dirname}/config/config.env` });
const connectDB = require('./config/db');
// Handle uncaughtException globally
process.on('uncaughtException', (err) => {
  console.log(`Caught uncaught exception! server shutting down...`);
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app.js');

connectDB();

const PORT = process.env.PORT || 500;
const server = app.listen(
  PORT,
  console.log(`Server up on port ${PORT} in ${process.env.NODE_ENV} mode...`)
);

// Handle unhandledRejection globally
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`Caught unhandled rejection! server shutting down...`);

  // Let server finish handling pending reqs then shut down.
  server.close(() => process.exit(1)); // Exit on unhandled rejection use code 1
});
