const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const express = require('express');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json()); // let you process json queries
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1,
  message:
    'Too many request are sent from this IP, please try again after an hour',
  handler: (req, res, next, options) => {
    const { statusCode, message } = options;
    next(new AppError({ message, statusCode }));
  },
});
// used to limit the number of api request that are made on the server for a single IP address
app.use('/api', limiter);

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  next(
    new AppError({
      message: `Can't find ${req.originalUrl} on the server!`,
      statusCode: 404,
    })
  );
});

// Error handler
app.use(globalErrorHandler);

module.exports = app;
