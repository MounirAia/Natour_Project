const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');

const signToken = (params) =>
  jwt.sign({ ...params }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendJWTToken = (params) => {
  const { res, token, payload, statusCode } = params;
  let cookieOption = {};

  if (process.env.NODE_ENV === 'development') {
    cookieOption = {
      httpOnly: true, // make the cookie unalterable with the document object of the browser
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
    };
  } else if (process.env.NODE_ENV === 'production') {
    cookieOption = {
      httpOnly: true, // make the cookie unalterable with the document object of the browser
      secure: true, // make the cookie only usable in https domain
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
    };
  }

  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    ...payload,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await UserModel.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  newUser.password = undefined; // to not send the password in the response

  const token = signToken({ id: newUser._id });

  sendJWTToken({
    res,
    payload: {
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    },
    statusCode: 201,
    token,
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

  // 2) verify if the email is associated to an account
  const user = await UserModel.findOne({ email }).select('+password');
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

  sendJWTToken({
    res,
    payload: {
      status: 'success',
      token,
    },
    statusCode: 201,
    token,
  });
});

exports.logout = (req, res) => {
  if (req.cookies.jwt) {
    res.cookie('jwt', '', {
      maxAge: 0,
    });
  }

  res.status(200).json({
    payload: {
      status: 'success',
    },
  });
};

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1) verify if a token exist and follow valid format
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

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
    return next(
      new AppError({ message: 'Your token is invalid.', statusCode: 401 })
    );
  }

  // 3) verify if the user still exist
  const { id, iat } = decodedToken;

  const user = await UserModel.findById(id);
  if (!user) {
    return next(
      new AppError({ message: 'The user no longer exist.', statusCode: 404 })
    );
  }

  // 4) verify if the user did not change his password after the token was issued

  const passwordChangedAfterToken =
    user.didPasswordChangedAfterJWTTokenWasIssued({ tokenWasIssuedAt: iat });

  if (passwordChangedAfterToken) {
    return next(
      new AppError({
        message: 'The token is no longer valid due to a password change.',
        statusCode: 401,
      })
    );
  }

  req.user = user;
  res.locals.user = user; // for pug template

  next();
});
exports.verifyIfLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;

    // 2) verify if the token is valid

    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    ); // returns an object that is associated to the token

    if (!decodedToken) {
      return next();
    }

    // 3) verify if the user still exist
    const { id, iat } = decodedToken;

    const user = await UserModel.findById(id);
    if (!user) {
      return next();
    }

    // 4) verify if the user did not change his password after the token was issued

    const passwordChangedAfterToken =
      user.didPasswordChangedAfterJWTTokenWasIssued({ tokenWasIssuedAt: iat });

    if (passwordChangedAfterToken) {
      return next();
    }

    // assign the user variable for the templates
    res.locals.user = user;
  }
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
