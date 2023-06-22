const express = require('express');
// Import route methods in RouteController
const {
  getMonthlyStats,
  getTourStats,
  topFiveCheapTour,
  getTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  tourWithin,
  getDistance,
} = require('../controllers/tourController');
const {
  protectRoute,
  restrictTo,
} = require('../controllers/authentificationController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// nested router for the reviews
router.use('/:tourID/reviews', reviewRouter);

router
  .route('/')
  .get(getTours)
  .post(
    protectRoute,
    restrictTo({
      acceptedRoles: ['admin', 'lead-guide'],
    }),
    createTour
  );

router.route('/cheapest').get(topFiveCheapTour, getTours); // Alias routes
router.route('/stats').get(getTourStats);
router.route('/monthly-stats/:year').get(getMonthlyStats);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protectRoute,
    restrictTo({
      acceptedRoles: ['admin', 'lead-guide'],
    }),
    updateTour
  )
  .delete(
    protectRoute,
    restrictTo({
      acceptedRoles: ['admin', 'lead-guide'],
    }),
    deleteTour
  );

router.route('/tourWithin/:maxDistance/:latlng').get(tourWithin);
router.route('/tourWithin/:latlng').get(getDistance);

module.exports = router;
