const mongoose = require('mongoose');
const validator = require('validator');

const TourModel = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'A body description is required for the review.'],
      validate: [
        {
          validator: validator.isAscii,
          message: (val) =>
            'The body description should only contain Ascii characters.',
        },
      ],
    },
    rating: {
      type: Number,
      default: 5,
      min: [0, 'Rating must be greater or equal to 1.'],
      max: [5, 'Rating must be less or equal to 5'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An author is required for the review.'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'A tour is required for the review.'],
    },
  },
  // Create a field createdAt and updatedAt
  { timestamps: true }
);
reviewSchema.statics.updateTourRatingsStatistics = async function (parameters) {
  const { tourID } = parameters;
  const tourStats = await this.aggregate([
    { $match: { tour: tourID } },
    {
      $group: {
        _id: '$tour',
        numberOfRatings: { $sum: 1 },
        averageRatings: { $avg: '$rating' },
      },
    },
  ]);

  const tour = await TourModel.findById(tourID);
  if (tourStats.length > 0) {
    const { numberOfRatings, averageRatings } = tourStats[0];
    tour.ratingsQuantity = numberOfRatings;
    tour.ratingsAverage = averageRatings;
  } else {
    tour.ratingsQuantity = 0;
    tour.ratingsAverage = TourModel.schema.paths.ratingsAverage.defaultValue;
  }
  await tour.save();
};

reviewSchema.post('save', async function () {
  const ReviewModel = this.constructor;

  await ReviewModel.updateTourRatingsStatistics({ tourID: this.tour });
});

reviewSchema.pre(/^find/, async function () {
  this.populate('author');
});

reviewSchema.post('findOneAndDelete', async (deletedReview) => {
  if (deletedReview) {
    const ReviewModel = deletedReview.constructor;
    await ReviewModel.updateTourRatingsStatistics({
      tourID: deletedReview.tour,
    });
  }
});

reviewSchema.methods.updateReview = function (requestBody) {
  // Update the field that can be updated
  const keysYouCanUpdate = ['body', 'rating'];
  Object.keys(requestBody).forEach((key) => {
    if (keysYouCanUpdate.includes(key)) {
      const newValue = requestBody[key];
      if (newValue) {
        this[key] = newValue; // update the field with the new value
      }
    }
  });

  return this.save();
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
