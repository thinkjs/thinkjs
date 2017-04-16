const nunjucks = require('think-view-nunjucks');
const path = require('path');
const cookieSession = require('think-session-cookie');
const fileSession = require('think-session-file');

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
  type: 'file',
  common: {
    cookie: {
      name: 'test',
      keys: ['werwer', 'werwer'],
      signed: true
    }
  },
  cookie: {
    handle: cookieSession,
    cookie: {
      maxAge: 1009990 * 1000,
      keys: ['welefen', 'suredy'],
      encrypt: true
    }
  },
  file: {
    handle: fileSession,
    sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
  }
}


