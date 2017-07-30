const helper = require('think-helper');
const nodemailer = require('nodemailer');
const assert = require('assert');

function thinkMail(transport, options, callback) {
  // without custom config, read default config
  if (!transport) {
    transport = think.config('email').transport;
    options = think.config('email').options;
    callback = think.config('email').callback;
  }

  assert(helper.isObject(transport), 'think-email transport required an Object');
  assert(helper.isObject(options), 'think-email send email options required an Object');

  // send email
  const transporter = nodemailer.createTransport(transport);
  transporter.sendMail(options, (error, info) => {
    helper.isFunction(callback) && callback(error, info);
    transporter.close();
  });
}

module.exports = thinkMail;
