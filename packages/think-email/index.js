const thinkEmail = require('./email.js');

/**
 * extends to think, controller, context
 */
module.exports = {
  controller: {
    sendEmail: thinkEmail
  },
  context: {
    sendEmail: thinkEmail
  },
  think: {
    sendEmail: thinkEmail
  }
};
