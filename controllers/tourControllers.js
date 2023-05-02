const TourModel = require('../models/tourModel');
const APIFilter = require('../utils/apiFilter');

exports.getMonthlyStats = async (req, res, next) => {
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
};

exports.getTourStats = async (req, res, next) => {
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
};

exports.topFiveCheapTour = (req, res, next) => {
  req.query.sort = { price: 'asc', rating: 'desc' };
  req.query.select = 'name,ratingsAverage,price,difficulty,duration';
  req.query.limit = 5;
  next();
};

exports.getTours = async (req, res) => {
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
};

exports.createTour = async (req, res) => {
  // name, rating and price
  try {
    // const { name, rating, price } = req.body;
    const newTour = await TourModel.create(req.body);
    console.log(newTour);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'failed',
      message: e.message,
    });
  }
};

exports.getTour = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await TourModel.findById(id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    res.status(404).json({
      status: 'failed',
      message: e.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  const { id } = req.params;
  try {
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
  } catch (e) {
    res.status(404).json({
      status: 'failed',
      message: e.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    await TourModel.findByIdAndDelete(id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (e) {
    res.status(404).json({
      status: 'failed',
      message: e.message,
    });
  }
};
