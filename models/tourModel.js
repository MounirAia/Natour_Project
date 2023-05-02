const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      minlength: [10, 'A tour name should have 10 or more characters'],
      maxlength: [40, 'A tour name should not exceed 40 or more characters'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: [
        {
          validator: function (value) {
            if (value >= this.price) return false;
          },
          message: (params) => {
            return `The price discount: ${params.value} is greater than the actual price!`;
          },
        },
        {
          validator: function (value) {
            if (value == this.price - 1) return false;
          },
          message: (params) => {
            return `The price discount: ${params.value} is equal than the actual price - 1!`;
          },
        },
      ],
      required: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A tour difficulty should be either: easy, medium, difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  console.log(this.duration);
  return Math.round((this.duration / 7) * 10) / 10;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
