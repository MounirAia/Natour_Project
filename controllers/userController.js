const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');

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
