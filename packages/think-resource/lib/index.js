'use strict';
require('babel-polyfill');
require('babel-register')({
  ignore: false,
  cache: true
});

module.exports = require('../index');