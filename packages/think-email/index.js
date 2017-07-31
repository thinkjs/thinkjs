const helper = require('think-helper');
const nodemailer = require('nodemailer');
const assert = require('assert');

function thinkMail(transport, options) {

  assert(helper.isObject(transport), 'think-email transport required an Object');
  assert(helper.isObject(options), 'think-email send email options required an Object');

  // send email
  const transporter = nodemailer.createTransport(transport);
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      transporter.close();
      if(error) {
        reject(error);
      }else {
        resolve(info);
      }
    });
  });
}

module.exports = thinkMail;
