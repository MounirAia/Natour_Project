const TourModel = require('../models/tourModel');
const APIFilter = require('../utils/apiFilter');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getMonthlyStats = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const monthlyStats = await TourModel.aggregate([
    // "destructure" an array field of a document
    { $unwind: '$startDates' }, // Associate foreach date a db element
    {
      $match: {
        // make sure that the startDates is between the given year
        startDates: { $gte: new Date(year, 0), $lt: new Date(year + 1, 0) },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // group by month, retrieve month from date
        numberTours: { $sum: 1 }, // count the number of tours
        tours: { $push: '$name' }, // create a tours array that push the name of each given tour
      },
    },
    { $set: { month: '$_id' } }, // create a field called month, an alias to _id
    { $project: { _id: 0 } }, // do not display the _id field
    {
      $sort: { numberTours: -1 }, // sort by descending
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: monthlyStats.length,
    data: {
      monthlyStats,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // Search for mongodb operators to check for more operators on aggregate function
  const toursStat = await TourModel.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numberTours: { $sum: 1 },
        ratingsAverage: { $avg: '$ratingsAverage' },
        totalNumberOfRatings: { $sum: '$ratingsQuantity' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    {
      $sort: { ratingsAverage: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: toursStat.length,
    data: {
      toursStat,
    },
  });
});

exports.topFiveCheapTour = (req, res, next) => {
  req.query.sort = { price: 'asc', rating: 'desc' };
  req.query.select = 'name,ratingsAverage,price,difficulty,duration';
  req.query.limit = 5;
  next();
};

exports.getTours = catchAsync(async (req, res, next) => {
  const queryString = { ...req.query };

  const parameters = {
    queryObj: TourModel.find(),
    queryString: queryString,
    maxNumberOfFilterParameters: 6,
  };

  const tours = await new APIFilter(parameters)
    .filter()
    .sort()
    .select()
    .paginate()
    .getQueryObject();

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await TourModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await TourModel.findById(id).populate('reviews');

  if (!tour) {
    return next(
      new AppError({
        message: `No tour founded for the ID ${id}.`,
        statusCode: 404,
      })
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await TourModel.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await TourModel.findByIdAndDelete(id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Test if results are true
// Work on error message
// /tourWithin/:maxDistance/:latlng
exports.tourWithin = catchAsync(async (req, res, next) => {
  // in km
  const { maxDistance, latlng } = req.params;
  const [latitude, longitude] = latlng.split(',');
  if (!maxDistance || !Number.isFinite(parseFloat(maxDistance))) {
    return next(
      new AppError({
        message: 'A valid max distance is needed.',
        statusCode: 400,
      })
    );
  }

  if (
    !latitude ||
    !longitude ||
    !Number.isFinite(parseFloat(latitude)) ||
    !Number.isFinite(parseFloat(longitude))
  ) {
    return next(
      new AppError({
        message: 'A valid latitude and a valid longitude is needed.',
        statusCode: 400,
      })
    );
  }
  const tours = await TourModel.find({
    startLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(maxDistance * 1000),
      },
    },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng } = req.params;
  const [latitude, longitude] = latlng.split(',');

  if (
    !latitude ||
    !longitude ||
    !Number.isFinite(parseFloat(latitude)) ||
    !Number.isFinite(parseFloat(longitude))
  ) {
    return next(
      new AppError({
        message: 'A valid latitude and a valid longitude is needed.',
        statusCode: 400,
      })
    );
  }

  const distances = await TourModel.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        distanceField: 'distance',
      },
    },
    {
      $project: {
        name: 1,
        distance: { $round: [{ $divide: ['$distance', 1000] }, 2] },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: distances.length,
    data: {
      distances,
    },
  });
});
