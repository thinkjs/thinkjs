const router = require('think-router');
const trace = require('think-trace');
const meta = require('think-meta');
const logic = require('think-logic');
const payload = require('think-payload');
const controller = require('think-controller');

module.exports = [{
    handle: trace, 
    options: {
      debug: true
    }
  },{
    handle: meta,
    options: {}
  },{
    handle: router, 
    options: {}
  },{
    handle: logic
  },{
    handle: payload,
    options: {}
  },{
    handle: controller
  }
];
