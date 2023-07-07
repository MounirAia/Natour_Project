const AppError = require('../utils/appError');

// Just send the full error
// Good for debuging
const sendErrorDev = (req, res, error) => {
  const isApiError = req.originalUrl.startsWith('/api');
  const {
    message = 'Something wrong happened.',
    status = 'error',
    statusCode = 500,
    stack,
  } = error;

  if (isApiError) {
    // Send JSON response if error made on api call
    res.status(statusCode).json({
      status,
      error,
      message,
      stack,
    });
  } else {
    // Send Page Render response if error made on website
    res
      .status(statusCode)
      .render('error', { title: 'Something wrong happened', message });
  }
};

// Send a well formated error for users
const sendErrorProd = (req, res, error) => {
  const { message, status, statusCode, isOperational } = error;
  const isApiError = req.originalUrl.startsWith('/api');

  if (isOperational) {
    if (isApiError) {
      res.status(statusCode).json({
        status,
        message,
      });
    } else {
      // render error if not api error
      res
        .status(statusCode)
        .render('error', { title: 'Something wrong happened', message });
    }
  } else {
    // For debuging in the host console
    console.error('ERROR:', error);
    console.error(error.name, error.message);
    if (isApiError) {
      res.status(500).json({
        status: 'error',
        message: 'Something wrong happened.',
      });
    } else {
      // render error if not api error
      res.status(500).render('error', {
        title: 'Something wrong happened',
        message: 'Something wrong happened.',
      });
    }
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
    } else if (this.errorObj.name === 'JsonWebTokenError') {
      this.messages.push(this.handleJWTError());
    } else if (this.errorObj.name === 'TokenExpiredError') {
      this.messages.push(this.handleJWTExpiredToken());
    } else if (this.errorObj.type === 'entity.too.large') {
      this.messages.push(this.handleRequestBodyToLarge());
    }
  }

  handleDuplicateKeyError() {
    const attributes = Object.keys(this.errorObj.keyValue);

    return `The [${attributes.join(',')}]: must be unique.`;
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

  handleJWTError() {
    if (this.errorObj.message === 'invalid signature') {
      return 'The JWT token signature is invalid.';
    }
    if (this.errorObj.message === 'jwt malformed') {
      return 'The JWT token is malformed.';
    }
    if (this.errorObj.message === 'invalid token') {
      return 'The JTW token is invalid';
    }
  }

  handleJWTExpiredToken() {
    return 'The JWT token is expired.';
  }

  handleRequestBodyToLarge() {
    return `The request body is too large. It should not exceed ${this.errorObj.limit} kb.`;
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
    sendErrorDev(req, res, error);
  } else if (process.env.NODE_ENV === 'production') {
    const errorHandler = new ErrorHandler({ errorObj: error });
    sendErrorProd(req, res, errorHandler.GetErrorObject());
  }
};

module.exports = errorController;
