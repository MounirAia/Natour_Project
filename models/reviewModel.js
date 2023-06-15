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

reviewSchema.post('save', async function () {
  const tour = await TourModel.findById(this.tour._id);
  await tour.incrementRatingQuantity({ rating: this.rating });
});

reviewSchema.pre(/^find/, async function () {
  this.populate('author');
});

reviewSchema.post('findOneAndDelete', async (deletedReview) => {
  const tour = await TourModel.findById(deletedReview.tour._id);
  await tour.decrementRatingQuantity({ rating: deletedReview.rating });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
