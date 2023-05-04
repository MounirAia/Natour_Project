class AppError extends Error {
  constructor(params) {
    const { message, statusCode } = params;
    super(message);
    this.statusCode = statusCode;
    const firstDigitStatusCode = String(this.statusCode)[0];
    this.status = firstDigitStatusCode == '4' ? 'failed' : 'error';
    this.isOperational = true;

    // add a stack field with the stack trace value in the error object
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
