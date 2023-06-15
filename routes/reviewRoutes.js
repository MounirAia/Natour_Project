const express = require('express');

const router = express.Router();

const {
  protectRoute,
  restrictTo,
} = require('../controllers/authentificationController');
const {
  createReview,
  getAllReviews,
  deleteReview,
} = require('../controllers/reviewController');

router
  .route('/')
  .get(protectRoute, getAllReviews)
  .post(protectRoute, restrictTo({ acceptedRoles: ['user'] }), createReview);
router.route('/:id').delete(protectRoute, deleteReview);
module.exports = router;
