const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A name is required for a user'],
  },
  email: {
    type: String,
    trim: true,
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
});

// Hash user password
UserSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Sign and return a token
UserSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

module.exports = mongoose.model('User', UserSchema);