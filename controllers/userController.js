const {
  getAll,
  getOne,
  addOne,
  updateOne,
  deleteOne,
} = require('./handlerFactory');
const User = require('../models/User');

// @desc    Get users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = getAll(User);

// @desc    Get a user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = getOne(User);

// @desc    Add a users
// @route   POST /api/v1/users
// @access  Private
exports.addUser = addOne(User);

// @desc    Update a users
// @route   PATCH /api/v1/users/:id
// @access  Private
exports.updateUser = updateOne(User);

// @desc    Delete a users
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = deleteOne(User);
