const ReviewModel = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

// CRUD
exports.createReview = catchAsync(async (req, res, next) => {
  const { user } = req;
  const review = await ReviewModel.create({ ...req.body, author: user._id });

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const reviews = await ReviewModel.find({ author: _id });

  res.status(201).json({
    status: 'success',
    size: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await ReviewModel.findByIdAndDelete({ _id: id });

  res.status(201).json({
    status: 'success',
    data: {
      message: 'The review has been successfully deleted.',
    },
  });
});
