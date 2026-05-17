const thinkCache = require('./cache.js');

/**
 * extends to think, controller, context
 */
module.exports = {
  controller: {
    cache: thinkCache
  },
  context: {
    cache: thinkCache
  },
  think: {
    cache: thinkCache
  }
};
