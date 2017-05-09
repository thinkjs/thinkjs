const router = require('think-router');
const trace = require('think-trace');
const meta = require('think-meta');
const logic = require('think-logic');
const controller = require('think-controller');
const resource = require('think-resource');
const payload = require('think-payload');
const path = require('path');

module.exports = [
  {
    handle: meta,
    options: {}
  },
  {
    handle: trace,
    options: {
      debug: true
    }
  },
  {
    handle: resource,
    enable: think.env === 'development',
    options: {
      root: path.join(think.ROOT_PATH, 'www'),
      publicPath: /^\/(static|favicon\.ico)/
    }
  },
  {
    handle: payload,
    options: {
      
    }
  },
  {
    handle: router, 
    options: {}
  },
  {
    handle: logic
  },
  {
    handle: controller
  }
];
