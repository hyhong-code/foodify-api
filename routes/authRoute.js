const express = require('express');

const {
  protect,
  signUp,
  login,
  loadMe,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/loadme').get(protect, loadMe);

module.exports = router;
