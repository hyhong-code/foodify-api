const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Please enter a review'],
    minlength: [50, 'A review must be more than 15 characters'],
  },
  rating: {
    type: Number,
    min: [1, 'A rating must be at least 1'],
    max: [5, 'A rating must be no more than 5'],
    required: [true, 'A rating is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A review must belongs to a user'],
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: [true, 'A review must belongs to a restaurant'],
  },
});

// Ensure one user can only post one review for each restaurant
ReviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
