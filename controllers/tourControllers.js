const TourModel = require('../models/tourModel');

exports.topFiveCheapTour = (req, res, next) => {
  req.query.sort = { price: 'asc', rating: 'desc' };
  req.query.select = 'name,rating,price,difficulty';
  req.query.limit = 5;

  next();
};

exports.getTours = async (req, res) => {
  const queryString = { ...req.query };
  console.log(queryString);
  // Usage of Query paramters for filtering.
  const acceptedQueryParameters = [
    'ratingsAverage',
    'difficulty',
    'price',
    'ratingsQuantity',
    'startDates',
    'maxGroupSize',
  ];

  const excludedQueryParameters = ['sort', 'select', 'page', 'limit'];

  excludedQueryParameters.forEach((queryParameter) => {
    delete queryString[queryParameter];
  });

  // 1) Filter tours query by field values
  const filters = {};
  const keysOfRequestQuery = Object.keys(queryString);
  // check if the query string is not too long
  if (keysOfRequestQuery.length < acceptedQueryParameters.length) {
    // start adding each of the filter to the filters obj
    keysOfRequestQuery.forEach((key) => {
      const specificFilter = queryString[key];
      if (typeof specificFilter === 'object') {
        // filter of the form {filter:{lte:5, <othersubfilter>:<value>}}
        // must be replaced by {filter:{$lte:5,...}}
        const keysOfSpecificFilter = Object.keys(specificFilter);
        keysOfSpecificFilter.forEach((specificFilterKey) => {
          filters[key] = {};
          filters[key][`$${specificFilterKey}`] =
            specificFilter[specificFilterKey];
        });
      } else {
        filters[key] = specificFilter;
      }
    });
  }

  // console.log(filters);
  const dbQuery = TourModel.find(filters);

  // 2) Sort the query
  if (req.query.sort) {
    dbQuery.sort(req.query.sort);
  } else {
    dbQuery.sort({ price: 'desc' });
  }

  // 3) Selecting the fields you want
  if (req.query.select) {
    const selectedFields = req.query.select.split(',').join(' ');
    dbQuery.select(selectedFields);
  } else {
    dbQuery.select('-__v');
  }

  // 4) pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  dbQuery.skip(skip).limit(limit);

  const tours = await dbQuery;
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
    const { name, rating, price } = req.body;
    const newTour = await TourModel.create({ name, rating, price });
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
