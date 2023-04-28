const express = require('express');
// Import route methods in RouteController
const {
  topFiveCheapTour,
  getTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourControllers');

const router = express.Router();

router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// Alias routes
router.route('/cheapest').get(topFiveCheapTour, getTours);

module.exports = router;
