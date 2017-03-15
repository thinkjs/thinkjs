const router = require('think-router');

module.exports = [
  'body_parser',
  {handle: router, options: {}},
  'logic',
  'controller'
];