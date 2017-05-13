const path = require('path');

module.exports = [
  {
    handle: 'meta'
  },
  {
    handle: 'trace',
    options: {
      debug: think.env === 'development'
    }
  },
  {
    handle: 'resource',
    enable: think.env === 'development',
    options: {
      root: path.join(think.ROOT_PATH, 'www'),
      publicPath: /^\/(static|favicon\.ico)/
    }
  },
  {
    handle: 'payload'
  },
  {
    handle: 'router', 
    options: {}
  },
  {
    handle: 'logic'
  },
  {
    handle: 'controller'
  }
];
