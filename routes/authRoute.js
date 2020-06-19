const express = require('express');

const {
  protect,
  signUp,
  login,
  loadMe,
  updateInfo,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteMe,
} = require('../controllers/authController');

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resetToken').patch(resetPassword);

router.route('/loadme').get(protect, loadMe);
router.route('/updateinfo').patch(protect, updateInfo);
router.route('/updatepassword').patch(protect, updatePassword);
router.route('/deleteme').delete(protect, deleteMe);

module.exports = router;
