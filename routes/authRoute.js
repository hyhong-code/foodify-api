const express = require('express');

const {
  protect,
  signUp,
  login,
  loadMe,
  updateInfo,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/loadme').get(protect, loadMe);
router.route('/updateinfo').patch(protect, updateInfo);
router.route('/updatepassword').patch(protect, updatePassword);

module.exports = router;
