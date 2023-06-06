const express = require('express');
const {
  signup,
  login,
  protectRoute,
  forgotPassword,
  resetPassword,
} = require('../controllers/authentificationController');
const { getUsers, updateUser } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword', resetPassword);

router.route('/').get(protectRoute, getUsers);
router.route('/:id').post(updateUser);

module.exports = router;
