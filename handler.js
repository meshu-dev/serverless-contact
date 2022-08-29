'use strict';

require('dotenv').config();

const axios = require('axios').default;
const nodemailer = require('nodemailer');

const isTokenValid = async (token) => {
  let url = process.env.GOOGLE_RECAPTCHA_URL;
  url = `${url}?secret=${process.env.GOOGLE_SECRET_KEY}&response=${token}`;

  const response = await axios.post(url);

  return response.data ? response.data.success : false;
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

const getMailParams = (params) => {
    const name = params.name;
    const email = params.email;
    const message = params.message;

    const emailTitle = 'CV - Contact message';
    const emailText = `Name: ${name}\n\nEmail: ${email}\n\nMessage: ${message}`;
    
    return {
      from: process.env.MAILER_FROM,
      to: process.env.MAILER_TO,
      subject: emailTitle,
      text: emailText
    };
};

const sendMail = async (params) => {
  const transporter = getTransporter();
  const mailOptions = getMailParams(params);

  const response = await transporter.sendMail(mailOptions);
  return response;
};

const getResponse = (statusCode, params) => {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': process.env.CV_SITE_URL,
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(params)
  };
};

const getSentResponse = (params) => {
  params['success'] = true;
  params['msg'] = 'Message has been sent';

  return getResponse(200, params);
};

const sendContactMessage = async (body) => {
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }
  const isValid = await isTokenValid(body.token);
  
  if (isValid) {
    const response = await sendMail(body);
    return response.messageId ? true : false;
  }
  return false;
};

const handleRequest = async (event) => {
  let statusCode = 406,
      params = { isSent: false };

  if (event.body) {
    const isSent = await sendContactMessage(event.body);
    
    if (isSent) {
      statusCode = 200;
      params = { isSent: true };
    }
  }
  return getResponse(statusCode, params);
};

module.exports.hello = handleRequest;
