const mock = require('./lib/mock');

module.exports = app => {
  return {
    controller: {
      mock: mock(app, 'controller'),
    },

    service: {
      mock: mock(app, 'service'),
    }
  }
};