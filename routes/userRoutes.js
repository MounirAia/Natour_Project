const express = require('express');
const {
  signup,
  login,
  protectRoute,
} = require('../controllers/authentificationController');
const { getUsers, updateUser } = require('../controllers/userController');

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.route('/').get(protectRoute, getUsers);
router.route('/:id').post(updateUser);

module.exports = router;
