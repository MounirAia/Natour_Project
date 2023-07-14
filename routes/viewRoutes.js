const express = require('express');

const router = express.Router();

const {
  getOverview,
  getTour,
  login,
  me,
  signup,
  forgotPassword,
  resetPassword,
} = require('../controllers/viewController');
const {
  verifyIfLoggedIn,
  protectRoute,
} = require('../controllers/authentificationController');

router.get('/me', protectRoute, me);

router.use(verifyIfLoggedIn);

router.get('/', getOverview);
router.get('/signup', signup);
router.get('/forgotPassword', forgotPassword);
router.get('/resetPassword', resetPassword);
router.get('/login', login);
router.get('/tour/:tourSlug', getTour);

module.exports = router;
