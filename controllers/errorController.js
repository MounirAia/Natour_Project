const AppError = require('../utils/appError');

// Just send the full error
// Good for debuging
const sendErrorDev = (res, error) => {
  const {
    message = 'Something wrong happened.',
    status = 'error',
    statusCode = 500,
    stack,
  } = error;

  res.status(statusCode).json({
    status,
    error,
    message,
    stack,
  });
};

// Send a well formated error for users
const sendErrorProd = (res, error) => {
  const { message, status, statusCode, isOperational } = error;
  if (isOperational) {
    res.status(statusCode).json({
      status,
      message,
    });
  } else {
    // For debuging in the host console
    console.error('ERROR:', error);
    res.status(500).json({
      status: 'error',
      message: 'Something wrong happened.',
    });
  }
};

class ErrorHandler {
  constructor(params) {
    const { errorObj } = params;
    this.errorObj = errorObj;
    this.messages = [];

    this.HandleError();
  }

  HandleError() {
    // These are errors that mongoose throws and not handle in controller
    if (this.errorObj.name === 'CastError') {
      this.messages.push(this.handleCastError());
    } else if (this.errorObj.code === 11000) {
      this.messages.push(this.handleDuplicateKeyError());
    } else if (this.errorObj.name === 'ValidatorError') {
      this.messages.push(this.handleValidatorError());
    } else if (this.errorObj.name === 'ValidationError') {
      this.handleValidationError();
    }
  }

  handleDuplicateKeyError() {
    const attribute = Object.keys(this.errorObj.keyValue)[0];
    const invalidValue = this.errorObj.keyValue[attribute];
    return `The ${attribute}: ${invalidValue} already exist in the database.`;
  }

  handleCastError() {
    const { path, value } = this.errorObj;
    return `The ${path}: ${value} is invalid.`;
  }

  handleValidatorError() {
    return this.errorObj.message;
  }

  handleValidationError() {
    const fullErrorObject = this.errorObj;
    Object.keys(fullErrorObject.errors).forEach((fieldWithError) => {
      this.errorObj = fullErrorObject.errors[fieldWithError];
      this.HandleError();
    });
  }

  GetErrorObject() {
    if (this.messages.length > 0) {
      const message = this.messages.join(' ');
      return new AppError({
        message,
        statusCode: 400,
      });
    }

    return this.errorObj;
  }
}

// The error controler
const errorController = (error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, error);
  } else if (process.env.NODE_ENV === 'production') {
    const errorHandler = new ErrorHandler({ errorObj: error });
    sendErrorProd(res, errorHandler.GetErrorObject());
  }
};

module.exports = errorController;
