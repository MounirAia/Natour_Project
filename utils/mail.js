const nodemailer = require('nodemailer');

module.exports = async (params) => {
  let transporterOption = {};

  // in development mode I use maildev to catch the email we send
  if (process.env.NODE_ENV === 'development') {
    transporterOption = {
      port: process.env.EMAIL_PORT,
    };
  }

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(transporterOption);
  // Params can be { to, subject, text, html }
  const opt = {
    from: `${process.env.EMAIL_SENDER}`, // sender address
    ...params,
  };

  // send mail with defined transport object
  await transporter.sendMail(opt);
};
