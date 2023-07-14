const TourModel = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await TourModel.find({});
  res.render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { tourSlug } = req.params;
  const tour = await TourModel.findOne({ slug: tourSlug }).populate('reviews');
  if (!tour) {
    return next(
      new AppError({
        message: 'No tour has been found with this name!',
        statusCode: 404,
      })
    );
  }
  res.render('specificTour', { title: tour.name, tour });
});

exports.signup = (req, res) => {
  res.render('signup', { title: 'Sign Up' });
};

exports.login = catchAsync(async (req, res) => {
  res.render('login', { title: 'Login' });
});

exports.forgotPassword = (req, res) => {
  res.render('forgotPassword', { title: 'Forgot Password' });
};

exports.resetPassword = (req, res) => {
  res.render('resetPassword', { title: 'Reset Password' });
};

exports.me = catchAsync(async (req, res) => {
  const { active = 1 } = req.query;
  res.render('userAccount', { title: 'User Account', active });
});
