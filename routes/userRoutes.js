const express = require('express');
const {
  signup,
  login,
  protectRoute,
  restrictTo,
} = require('../controllers/authentificationController');
const {
  getUsers,
  updateUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMyInfo,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword', resetPassword);
router.patch('/updatePassword', protectRoute, updatePassword);

router.get('/', protectRoute, getUsers);
router.patch('/updateMyInfo', protectRoute, updateMyInfo);
router.patch(
  '/:id',
  protectRoute,
  restrictTo({ acceptedRoles: ['admin'] }),
  updateUser
);

module.exports = router;
