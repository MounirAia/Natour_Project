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
          message: (params) =>
            `The price discount: ${params.value} is greater than the actual price!`,
        },
        {
          validator: function (value) {
            if (value === this.price - 1) return false;
          },
          message: (params) =>
            `The price discount: ${params.value} is equal than the actual price - 1!`,
        },
      ],
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
      min: [0, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: function (value) {
        return parseFloat(value.toFixed(2));
      },
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
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: [true, 'A start location is required.'],
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required for the start location.'],
      },
      description: {
        type: String,
      },
      address: {
        type: String,
      },
      day: {
        type: Number,
        default: 0,
      },
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
          required: [
            true,
            'Coordinates are required for the starting location.',
          ],
          validate: {
            validator: function (value) {
              const { startLocation } = this.parent();
              const { coordinates: startLocationCoordinate } = startLocation;
              if (
                value[0] === startLocationCoordinate[0] &&
                value[1] === startLocationCoordinate[1]
              )
                return false;

              return true;
            },
            message: (params) =>
              `The intermediate location ${params.value} cannot be equal to the start location.`,
          },
        },
        description: {
          type: String,
        },
        day: {
          type: Number,
          required: [
            true,
            'All locations should be associated to a day value.',
          ],
        },
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // to return in "find" result the value of virtuals of the document
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return Math.round((this.duration / 7) * 10) / 10;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.methods.incrementRatingQuantity = async function (parameters) {
  const { rating } = parameters;
  this.ratingsAverage =
    (this.ratingsAverage * this.ratingsQuantity + rating) /
    (this.ratingsQuantity + 1);

  this.ratingsQuantity += 1;
  await this.save();
};

tourSchema.methods.decrementRatingQuantity = async function (parameters) {
  const { rating } = parameters;
  const newAverage =
    (this.ratingsQuantity * this.ratingsAverage - rating) /
    (this.ratingsQuantity - 1);

  this.ratingsQuantity -= 1;
  this.ratingsAverage = newAverage;

  await this.save();
};

// query middleware, this=query object
tourSchema.pre(/^find/, async function () {
  this.populate({
    path: 'guides',
  }).select('-__v');
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
