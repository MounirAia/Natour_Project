const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = (params) => {
  const { id } = params;
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await UserModel.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = signToken({ id: newUser._id });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      tour: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) verify if the credential are there
  if (!email || !password) {
    return next(
      new AppError({
        message: 'Need an email and a password.',
        statusCode: 400,
      })
    );
  }

  const user = await UserModel.findOne({ email }).select('+password');
  // 2) verify if the if the email is associated to an account
  if (!user) {
    return next(
      new AppError({ message: 'Invalid credential.', statusCode: 400 })
    );
  }

  // 3) verify if the password is correct
  const isPasswordCorrect = await user.verifyPassword({
    givenPassword: password,
    userPassword: user.password,
  });

  if (!isPasswordCorrect) {
    return next(
      new AppError({ message: 'Invalid credential.', statusCode: 401 })
    );
  }

  const token = signToken({ id: user._id });

  res.status(201).json({
    status: 'success',
    token,
  });
});
