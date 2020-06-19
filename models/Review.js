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

// Populate user and restaurant
ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email',
  }).populate({
    path: 'restaurant',
    select: 'name mainAddress',
  });
  next();
});

// Re-calculate Restaurant average ratings after saving review
ReviewSchema.post('save', async function (doc, next) {
  await this.constructor.calcAverageRating(this.restaurant);
  next();
});

// Re-calculate Restaurant average ratings after review update and delete
ReviewSchema.post(/^findOneAnd/, async function (doc, next) {
  await doc.constructor.calcAverageRating(doc.restaurant);
  next();
});

// Calculate average restaurant ratings using aggregation on model
ReviewSchema.statics.calcAverageRating = async function (restaurantId) {
  const result = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: '$restaurant',
        averageRating: { $avg: '$rating' },
        ratingsQty: { $sum: 1 },
      },
    },
  ]);
  console.log(result);

  if (!result.length) {
    // No reviews
    await this.model('Restaurant').findByIdAndUpdate(
      restaurantId,
      {
        averageRating: 4.5,
        ratingsQty: 0,
      },
      { runValidators: true }
    );
  } else {
    console.log(restaurantId);
    const { averageRating, ratingsQty } = result[0];
    await this.model('Restaurant').findByIdAndUpdate(
      restaurantId,
      {
        averageRating,
        ratingsQty,
      },
      { runValidators: true }
    );
  }
};

module.exports = mongoose.model('Review', ReviewSchema);
