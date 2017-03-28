const router = require('think-router');
const trace = require('think-trace');

module.exports = [
  {handle: trace, options: {debug: true}},
  'meta',
  {handle: router, options: {}},
  'logic',
  'controller'
];