const nunjucks = require('think-view-nunjucks');
const cookie = require('think-session-cookie');
const path = require('path');

//view adapter config
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html'
  },
  nunjucks: {
    handle: nunjucks
  }
}

//session adapter config
exports.session = {
  type: 'cookie',
  common: {
    cookie: {
      name: 'test'
    }
  },
  cookie: {
    handle: cookie,
    cookie: {
      maxAge: 1009990 * 1000,
      keys: ['welefen', 'suredy'],
      encrypt: true
    }
  }
}


