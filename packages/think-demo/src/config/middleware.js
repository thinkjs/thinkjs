const router = require('think-router');

module.exports = [
  'meta',
  {handle: router, options: {}},
  'logic',
  'controller'
];