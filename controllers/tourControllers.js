const TourModel = require('../models/tourModel');
const { APIFilter } = require('../utils/apiFilter');
exports.topFiveCheapTour = (req, res, next) => {
  req.query.sort = { price: 'asc', rating: 'desc' };
  req.query.select = 'name,rating,price,difficulty';
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
