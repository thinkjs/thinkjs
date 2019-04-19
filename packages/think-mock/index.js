const { mockControllerAction, mockServiceAction } = require('./lib/mock');

module.exports = app => {

  return {
    controller: {
      mock: mockControllerAction,
    },

    server: {
      mock: mockServiceAction,
    }
  }
};