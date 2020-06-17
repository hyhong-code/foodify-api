const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A name is required for a restaurant'],
    unique: [true, 'A name must be unique'],
    maxlength: [25, 'A name must be no more than 25 characters'],
  },
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
  averageRating: Number,
  ratingsQty: Number,
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
  address: String,
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
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
