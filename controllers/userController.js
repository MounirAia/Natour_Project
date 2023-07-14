const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/mail');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const name = file.originalname.split('.')[0];
//     const extension = file.originalname.split('.')[1];
//     const filename = `${name}-${req.user._id}-${Date.now()}.${extension}`;
//     cb(null, filename);
//   },
// });
const storage = multer.memoryStorage();

const fileFilter = function (req, file, cb) {
  if (!file.mimetype.startsWith('image')) {
    cb(
      new AppError({
        message: 'Please upload an Image.',
        statusCode: 400,
      })
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

exports.loadAPhoto = upload.single('photo');

exports.resizeAPhoto = catchAsync(async (req, res, next) => {
  if (req.file) {
    const name = req.file.originalname.split('.')[0];
    const filename = `${name}-${req.user._id}-${Date.now()}.jpg`;
    req.file.filename = filename;
    const { buffer } = req.file;
    await sharp(buffer)
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toFile(`./public/img/users/${filename}`);
  }
  next();
});

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

exports.getMe = catchAsync(async (req, res, next) => {
  const { user } = req;
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // Route available for an admin to update a user info externaly
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) {
    return next(
      new AppError({ message: 'User no longer exist.', statusCode: 401 })
    );
  }

  await user.updateUser(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Route that handles the update of a logged user in his account

  // 1) get User and update it's info
  const { user } = req;

  // 2) check if there are photos sent by the user
  if (req.file) {
    req.body.photo = req.file.filename;
  }

  await user.updateUser(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user,
      message: 'Successfully updated your info!',
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the email of the user
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(
      new AppError({
        message: 'No account is associated to this email.',
        statusCode: 404,
      })
    );
  }
  // 2) Generate random token to send the email to user and store the encrypted token into user's data
  const { token: plainToken, hashedToken } = await user.createResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordTokenExpiration = Date.now() + 10 * 60 * 1000; // 10 min expiration date for the token

  await user.save({ validateBeforeSave: false });

  // 3) Send code to user's email
  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword?token=${plainToken}&email=${email}`;
    await new Email().sendForgotPassword({
      name: user.name,
      url,
      to: user.email,
    });

    res.status(201).json({
      status: 'success',
      data: { message: 'The email was successfully sent!' },
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiration = undefined;
    await user.save({ validateBeforeSave: false });

    next(
      new AppError({
        message: 'A problem occured when sending the email.',
        statusCode: 500,
      })
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) retrieve data from request body
  const { token, email } = req.body;

  // 2) Verify if the reset password token of the user is valid
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(
      new AppError({
        message: 'No account is associated to this email.',
        statusCode: 404,
      })
    );
  }

  const isTokenValid = await user.verifyResetToken(token);

  if (!isTokenValid) {
    return next(
      new AppError({
        message: 'The given token is invalid.',
        statusCode: 403,
      })
    );
  }

  // 3) Update the user password with the data inside the body
  const { password, passwordConfirm } = req.body;
  await user.updatePassword({ password, passwordConfirm });

  res.status(201).json({
    status: 'success',
    data: { message: 'The password was successfully updated!' },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // route made to allow loged in user to update there passwords
  // 1) First the user need to enter his old password
  const user = await UserModel.findById(req.user.id).select('+password');
  const { oldPassword, newPassword, passwordConfirm } = req.body;

  const isGivenPasswordCorrect = await user.verifyPassword({
    givenPassword: oldPassword,
    userPassword: user.password,
  });

  if (!isGivenPasswordCorrect) {
    return next(
      new AppError({ message: 'Invalid credential.', statusCode: 401 })
    );
  }

  // 2) update the password
  await user.updatePassword({ password: newPassword, passwordConfirm });

  res.status(201).json({
    status: 'success',
    data: { message: 'The password was successfully updated.' },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Route used to allow user to delete his account
  const { user } = req;

  await UserModel.deleteOne({ _id: user._id });

  res.status(200).json({
    status: 'success',
    data: {
      message: 'The user has been successfully deleted.',
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // Route used to allow admin to delete any users
  // 1) find the user to delete by id
  const { id } = req.params;

  const user = await UserModel.findById(id);
  if (!user) {
    return next(
      new AppError({ message: 'User no longer exist.', statusCode: 401 })
    );
  }

  // 2) delete the user to delete
  await UserModel.deleteOne({ _id: user._id });

  res.status(200).json({
    status: 'success',
    data: {
      message: 'The user has been successfully deleted.',
    },
  });
});
