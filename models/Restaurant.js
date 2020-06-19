const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geoCode');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A name is required for a restaurant'],
    unique: [true, 'A name must be unique'],
    maxlength: [25, 'A name must be no more than 25 characters'],
  },
  slug: String,
  maxTableSize: Number,
  affordability: {
    type: String,
    required: [true, 'Affordability is required'],
    enum: {
      values: ['affordable', 'regular', 'expensive'],
      message: 'Affordability must be of affordable, regular, or expensive',
    },
  },
  averageDishPrice: Number,
  averageRating: {
    type: Number,
    min: [1, 'A rating must be at least 1.'],
    max: [5, 'A rating must be no more than 5'],
    default: 4,
  },
  ratingsQty: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A description is required for a restaurant'],
    minlength: [50, 'A description must be at least 50 characters'],
    maxlength: [500, 'A description must be no more than 500 characters'],
  },
  imageCover: String,
  openDineIn: {
    type: Boolean,
    default: false,
  },
  veganFriendly: {
    type: Boolean,
    default: false,
  },
  mainAddress: {
    type: String,
    required: [true, 'mainAddress is required'],
  },
  addresses: {
    type: [String],
    defalt: [],
  },
  phone: {
    type: String,
    match: [
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
      'Please enter a valid phone number',
    ],
    required: [true, 'A phone number is required'],
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please enter a valid email address',
    ],
    required: [true, 'An email is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  banned: {
    type: Boolean,
    default: false,
    select: false,
  },
  mainLocation: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  locations: [
    {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  ],
  owners: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});

// Document middlwares - this refers to model instance
// Generate a slug
RestaurantSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode mainAddress
RestaurantSchema.pre('save', async function (next) {
  const result = await geocoder.geocode(this.mainAddress);
  this.mainAddress = result[0].formattedAddress;
  this.mainLocation = {
    type: 'Point',
    coordinates: [result[0].longitude, result[0].latitude],
  };

  if (!this.addresses.length) this.addresses = [result[0].formattedAddress];
  next();
});

// Geocode addresses
RestaurantSchema.pre('save', async function (next) {
  const resultPromises = this.addresses.map((address) =>
    geocoder.geocode(address)
  );
  const results = await Promise.all(resultPromises);
  this.addresses = results.map((val) => val[0].formattedAddress);
  this.locations = results.map((val) => ({
    type: 'Point',
    coordinates: [val[0].longitude, val[0].latitude],
  }));
  next();
});

// Query middlewares - this refers to query obj
// Exclude banned restaurants from query results (matches find, and findOne)
RestaurantSchema.pre(/^find/, function (next) {
  this.curTime = Date.now();
  this.find({ banned: { $ne: true } }).populate({
    path: 'owners',
    select: 'name email',
  }); // keep building qurey
  next();
});

RestaurantSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.curTime} milliseconds...`);
  next();
});

// Aggregation middlewares - this refers to aggregation object
RestaurantSchema.pre('aggregate', function (next) {
  // Exclude banned restaurants from aggregation
  this.pipeline().unshift({ $match: { banned: { $ne: true } } });
  next();
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
