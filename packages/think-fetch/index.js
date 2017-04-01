const request = require('request-promise-native');

const extend = {
  curl: request
};

module.exports = {
  context: extend,
  controller: extend
};