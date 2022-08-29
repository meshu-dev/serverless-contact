'use strict';

require('dotenv').config();

const axios = require('axios').default;
const nodemailer = require('nodemailer');

const isTokenValid = async (event) => {
  const params = {
    'secret': process.env.GOOGLE_SECRET_KEY,
    'response': event.body.token
  };

  const response = await axios.post(
    process.env.GOOGLE_RECAPTCHA_URL,
    params
  );

  if (response.data && response.data.success === true) {
    return true;
  }
  return false;
};

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAILER_USERNAME,
      pass: process.env.MAILER_PASSWORD
    }
  });
}

const getMailParams = (event) => {
    const name = event.body.name;
    const email = event.body.email;
    const message = event.body.message;

    const emailTitle = 'CV - Contact message';
    const emailText = `Name: ${name}\n\nEmail: ${email}\n\nMessage: ${message}`;
    
    return {
      from: process.env.MAILER_FROM,
      to: process.env.MAILER_TO,
      subject: emailTitle,
      text: emailText
    };
};

const sendMail = (event) => {
  const transporter = getTransporter();
  const mailOptions = getMailParams(event);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

const getResponse = (statusCode, params) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(params)
  };
};

const getSentResponse = (event, params) => {
  sendMail(event);

  params['success'] = true;
  params['msg'] = 'Message has been sent';

  return getResponse(200, params);
};

const handleRequest = async (event) => {
  let params = { isSuccess: false };

  if (event.body) {
    console.log('event.body', event.body);

    const isValid = await isTokenValid(event);
    
    if (isValid) {
      return getSentResponse(
        event,
        params
      );
    }
    params['msg'] = 'Token is invalid';
  } else {
    params['msg'] = 'Parameters are required';
  }
  return getResponse(406, params);
};

module.exports.hello = handleRequest;
