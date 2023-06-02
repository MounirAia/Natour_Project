const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await UserModel.find({});

  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) {
    next(new AppError({ message: 'User no longer exist.', statusCode: 401 }));
  }

  await user.updateUser(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
