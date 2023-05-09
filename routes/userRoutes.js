const express = require('express');
const { signup, login } = require('../controllers/authentificationController');
const { getUsers } = require('../controllers/userController');

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.route('/').get(getUsers);

module.exports = router;
