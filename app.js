const morgan = require('morgan');
const express = require('express');
const tourRoutes = require('./routes/tourRoutes');

const app = express();

app.use(express.json()); // let you process json queries
app.use(morgan('dev'));

app.use('/api/v1/tours', tourRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'failed',
    message: `Can't find $${req.originalUrl} on the server!`,
  });
});

module.exports = app;
