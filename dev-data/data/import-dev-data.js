const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './config-files/development.env' }); // will the env var in the global process.env obj
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './config-files/production.env' });
}

mongoose
  .connect(process.env.DATABASE.replace('<PORT>', process.env.DATABASE_PORT))
  .then(() => {
    console.log('Connected to the database!');
  });

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
