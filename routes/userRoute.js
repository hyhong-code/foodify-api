const express = require('express');

const { protect, authorize } = require('../controllers/authController');

const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').get(getUsers).post(addUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
