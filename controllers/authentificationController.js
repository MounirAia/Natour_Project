const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = (params) =>
  jwt.sign({ ...params }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await UserModel.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  const token = signToken({ id: newUser._id });

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
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

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1) verify if a token exist and follow valid format
  let token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer')) {
    return next(
      new AppError({
        message:
          'You are not logged in! You need to login to access this resource.',
        statusCode: 401,
      })
    );
  }

  token = token.split(' ')[1];
  if (!token) {
    return next(
      new AppError({
        message:
          'You are not logged in! You need to login to access this resource.',
        statusCode: 401,
      })
    );
  }

  // 2) verify if the token is valid

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  ); // returns an object that is associated to the token

  if (!decodedToken) {
    next(new AppError({ message: 'Your token is invalid.', statusCode: 401 }));
  }

  // 3) verify if the user still exist
  const { id, iat } = decodedToken;

  const user = await UserModel.findById(id);
  if (!user) {
    next(
      new AppError({ message: 'The user no longer exist.', statusCode: 404 })
    );
  }

  // 4) verify if the user did not change his password after the token was issued

  const passwordChangedAfterToken =
    user.didPasswordChangedAfterJWTTokenWasIssued({ tokenWasIssuedAt: iat });

  if (passwordChangedAfterToken) {
    next(
      new AppError({
        message: 'The token is no longer valid due to a password change.',
        statusCode: 401,
      })
    );
  }

  req.user = user;

  next();
});

exports.restrictTo = function (params) {
  // middleware that restrict access to authentified user to specific ressourse
  // e.g. only admin can delete users
  const { acceptedRoles } = params; // acceptedRole is an array of role
  return (req, res, next) => {
    if (!acceptedRoles.includes(req.user.role)) {
      return next(
        new AppError({
          message: 'You are not authorized to access this resource.',
          statusCode: 403,
        })
      );
    }
    next();
  };
};
