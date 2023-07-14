const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  send(parameters) {
    // message = {
    //   from: "sender@server.com",
    //   to: "receiver@sender.com",
    //   subject: "Message title",
    //   text: "Plaintext version of the message",
    //   html: "<p>HTML version of the message</p>"
    // };

    const { template, subject, to, templateArguments } = parameters;
    const templatePath = path.join(
      __dirname,
      '..',
      'views',
      'email',
      `${template}.pug`
    );
    const html = pug.renderFile(templatePath, templateArguments);
    const text = htmlToText.convert(html);
    const emailOption = {
      from: `${process.env.EMAIL_SENDER}`,
      to,
      subject: subject,
      text,
      html,
    };

    const transporter = this.createNewTransport();
    return transporter.sendMail(emailOption);
  }

  sendWelcome(parameters) {
    const { name, url, to } = parameters;
    return this.send({
      template: 'welcome',
      to,
      subject: 'Welcome to the Natour Family',
      templateArguments: {
        name,
        url,
      },
    });
  }

  sendForgotPassword(parameters) {
    const { name, url, to } = parameters;
    return this.send({
      template: 'forgotPassword',
      to,
      subject: 'Reset Your Natour Account Password',
      templateArguments: {
        name,
        url,
      },
    });
  }

  createNewTransport() {
    const transporterOption = {
      port: process.env.EMAIL_PORT,
    };
    return nodemailer.createTransport(transporterOption);
  }
};
