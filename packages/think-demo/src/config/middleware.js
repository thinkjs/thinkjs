const path = require('path');

module.exports = [
  {
    handle: 'meta'
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
    handle: 'trace',
    options: {
      debug: think.env === 'development'
    }
  },
  {
    handle: 'payload',
    options: {}
  },
  {
    handle: 'router', 
    options: {}
  },
  'logic',
  'controller'
];
