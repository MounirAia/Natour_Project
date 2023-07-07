const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const viewRoutes = require('./routes/viewRoutes');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// set up view engine to be pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Can load static file (such as css)
app.use(express.static(path.join(__dirname, 'public')));

// Set Secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
          'https://unpkg.com/axios/dist/axios.min.js',
        ],
        imgSrc: [
          "'self'",
          'https://tile.openstreetmap.org/',
          'https://unpkg.com/leaflet@1.9.4/dist/',
        ],
      },
    },
  })
);

// Limit the number of API request a single IP address can make in 1 hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message:
    'Too many request are sent from this IP, please try again after an hour',
  handler: (req, res, next, options) => {
    const { statusCode, message } = options;
    next(new AppError({ message, statusCode }));
  },
});

app.use('/api', limiter);

// let you process json body in incoming queries
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Prevent No SQL Injection
app.use(mongoSanitize());

// Development package to log request made to the API in the console
app.use(morgan('dev'));

app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

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
