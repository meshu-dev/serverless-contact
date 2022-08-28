'use strict';

require('dotenv').config();

const nodemailer = require('nodemailer');

module.exports.hello = async (event) => {
  let statusCode = 200,
      params = { isSuccess: false };

  if (event.body) {
    console.log('event.body', event.body);

    const name = event.body.name;
    const email = event.body.email;
    const message = event.body.message;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD
      }
    });

    const emailTitle = 'CV - Contact message';
    const emailText = `Name: ${name}\n\nEmail: ${email}\n\nMessage: ${message}`;
    
    let mailOptions = {
      from: process.env.MAILER_FROM,
      to: process.env.MAILER_TO,
      subject: emailTitle,
      text: emailText
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    params['success'] = true;
    params['msg'] = 'Message has been sent';
  } else {
    statusCode = 406;
    params['msg'] = 'Parameters are required';
  }

  const response = {
    statusCode: statusCode,
    body: JSON.stringify(params)
  };

  return response;
};
