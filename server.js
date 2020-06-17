require("dotenv").config({ path: `${__dirname}/config/config.env` });
const app = require("./app.js");

const PORT = process.env.PORT || 500;
const server = app.listen(
  PORT,
  console.log(`Server up on port ${PORT} in ${process.env.NODE_ENV} mode...`)
);
