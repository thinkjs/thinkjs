const path = require('path');
const cookieSession = require('think-session-cookie');
const fileSession = require('think-session-file');

module.exports = {
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