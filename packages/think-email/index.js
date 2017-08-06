const thinkEmail = require('./email.js');

/**
 * extends to think, controller, context
 */
module.exports = {
  controller: {
    cache: thinkEmail
  },
  context: {
    cache: thinkEmail
  },
  think: {
    cache: thinkEmail
  }
};
