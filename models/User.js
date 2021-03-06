const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A name is required for a user'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'An email is required for a user'],
      unique: [true, 'Email must be unique'],
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Please provide a valid email',
      },
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at lease 6 characters'],
      select: false,
      required: [true, 'Password is required'],
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (v) {
          return v === this.password;
        },
        message: 'Passwords do not match',
      },
      required: [true, 'Password confirm is required'],
    },
    role: {
      type: String,
      enum: ['user', 'owner'],
      default: 'user',
    },
    avatar: String,
    pwResetToken: String,
    pwResetTokenExpires: Date,
    pwChangedAt: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// For vitual populate reviews
UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
});

// Hash user password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.pwChangedAt = new Date(Date.now() - 5 * 1000);
  next();
});

// Filter out inactive users
UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Verify user password
UserSchema.methods.verifyPassword = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

// Sign and return a token
UserSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Check if password changed after jwt is issued
UserSchema.methods.checkPwChangedDate = function (jwtTimeStamp) {
  return this.pwChangedAt.getTime() / 1000 > jwtTimeStamp;
};

// Generate password reset token
UserSchema.methods.generateResetToken = async function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.pwResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.pwResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
  await this.save({ validateBeforeSave: false });
  return token;
};

module.exports = mongoose.model('User', UserSchema);
