const ReviewModel = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// CRUD current User
exports.createMyReview = catchAsync(async (req, res, next) => {
  // route: /api/v1/tours/:tourID/reviews/createMyReview
  const { _id: author } = req.user;
  const { tourID: tour } = req.params;

  // 1) verify if a tour id is present
  if (!tour) {
    return next(
      new AppError({
        message: `No tour ID founded.`,
        statusCode: 404,
      })
    );
  }

  // 2) create the review
  const { body, rating } = req.body;
  const review = await ReviewModel.create({ author, tour, body, rating });

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.readMyReviews = catchAsync(async (req, res, next) => {
  // route: /api/v1/reviews/readMyReviews
  const { _id: author } = req.user;

  // 1) Find all the reviews associated to the author
  const reviews = await ReviewModel.find({ author });

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.updateMyReview = catchAsync(async (req, res, next) => {
  // route: /api/v1/tours/:tourID/reviews/updateMyReview
  const { _id: author } = req.user;
  const { tourID: tour } = req.params;

  // 1) verify if a tour id is present
  if (!tour) {
    return next(
      new AppError({
        message: `No tour ID founded.`,
        statusCode: 404,
      })
    );
  }

  // 2) find my review
  const review = await ReviewModel.findOne({ author: author, tour: tour });

  if (!review) {
    return next(
      new AppError({
        message: `No review is associated with the given information.`,
        statusCode: 404,
      })
    );
  }

  // 3) update my review
  await review.updateReview(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.deleteMyReview = catchAsync(async (req, res, next) => {
  // route: /api/v1/tours/:tourID/reviews/deleteMyReview
  const { _id: author } = req.user;
  const { tourID: tour } = req.params;
  const { reviewID } = req.body;

  // 1) delete the review
  const deletedReview = await ReviewModel.findOneAndDelete({
    author,
    tour,
    _id: reviewID,
  });
  if (!deletedReview) {
    return next(
      new AppError({
        message: `The review no longer exist.`,
        statusCode: 404,
      })
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      message: 'The review has been successfuly deleted.',
    },
  });
});

// CRUD Admin
exports.adminCreateReview = catchAsync(async (req, res, next) => {
  // POST /api/.../reviews
  const review = await ReviewModel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.adminGetAllReviews = catchAsync(async (req, res, next) => {
  // Retrieve all the reviews associated to a tour or a user
  const filter = {};

  const { tour, author } = req.body;
  if (tour) filter.tour = tour;
  if (author) filter.author = author;

  const reviews = await ReviewModel.find(filter);

  res.status(200).json({
    status: 'success',
    size: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.adminUpdateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const review = await ReviewModel.findById(id);

  // 1) find the review
  if (!review) {
    return next(
      new AppError({
        message: `The review no longer exist.`,
        statusCode: 404,
      })
    );
  }

  // 2) update the review
  await review.updateReview(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.adminDeleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await ReviewModel.findOneAndDelete({ _id: id });

  if (!review) {
    return next(
      new AppError({
        message: `No review founded for the ID ${id}.`,
        statusCode: 404,
      })
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      message: 'The review has been successfully deleted.',
    },
  });
});
