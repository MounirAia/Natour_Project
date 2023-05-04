const morgan = require('morgan');
const express = require('express');
const tourRoutes = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json()); // let you process json queries
app.use(morgan('dev'));

app.use('/api/v1/tours', tourRoutes);

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
