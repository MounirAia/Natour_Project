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
} = require('../controllers/tourController');
const {
  protectRoute,
  restrictTo,
} = require('../controllers/authentificationController');

const router = express.Router();

router.route('/').get(getTours).post(createTour);
router.route('/cheapest').get(topFiveCheapTour, getTours); // Alias routes
router.route('/stats').get(getTourStats);
router.route('/monthly-stats/:year').get(getMonthlyStats);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(
    protectRoute,
    restrictTo({
      acceptedRoles: ['admin', 'lead-guide'],
    }),
    deleteTour
  );

module.exports = router;
