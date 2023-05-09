const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load the good environement variable files
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: './config-files/development.env' }); // will the env var in the global process.env obj
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: './config-files/production.env' });
}
const app = require('./app');

mongoose
  .connect(process.env.DATABASE.replace('<PORT>', process.env.DATABASE_PORT))
  .then(() => {
    console.log('Connected to the database!');
  });

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

// Handle unhandled sync error (error from code outside promises) that are not catch
process.on('uncaughtException', (error) => {
  console.log('Unchaught Exception! 🔥 Shutting Down...');
  console.log(error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle unhandled async error (error from promises) that are not catch
process.on('unhandledRejection', (error) => {
  console.log('Unhandled Rejection! 🔥 Shutting Down...');
  console.log(error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
