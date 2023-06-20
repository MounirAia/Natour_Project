const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  protectRoute,
  restrictTo,
} = require('../controllers/authentificationController');
const {
  createMyReview,
  readMyReviews,
  updateMyReview,
  deleteMyReview,
  adminCreateReview,
  adminGetAllReviews,
  adminUpdateReview,
  adminDeleteReview,
} = require('../controllers/reviewController');

router.use(protectRoute);

router
  .route('/createMyReview')
  .post(restrictTo({ acceptedRoles: ['user'] }), createMyReview);

router
  .route('/readMyReviews')
  .get(restrictTo({ acceptedRoles: ['user'] }), readMyReviews);

router
  .route('/updateMyReview')
  .patch(restrictTo({ acceptedRoles: ['user'] }), updateMyReview);

router
  .route('/deleteMyReview')
  .delete(restrictTo({ acceptedRoles: ['user'] }), deleteMyReview);

router.use(restrictTo({ acceptedRoles: ['admin'] }));
router.route('/').get(adminGetAllReviews).post(adminCreateReview);
router.route('/:id').delete(adminDeleteReview).patch(adminUpdateReview);

module.exports = router;
