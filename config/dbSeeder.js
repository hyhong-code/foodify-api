require("dotenv").config({ path: `${__dirname}/config.env` });
const mongoose = require("mongoose");
const fs = require("fs");
const Restaurant = require("../models/Restaurant");

// Connect to DB
(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB connected...`);
})();

const restaurants = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/restaurants.json`)
);

// Import data to DB
const importData = async () => {
  try {
    await Restaurant.create(restaurants);
    console.log("Data imported...");
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Restaurant.deleteMany();
    console.log("Data destroyed...");
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

// Controls
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
