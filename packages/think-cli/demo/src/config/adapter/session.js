const path = require('path');
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
  file: {
    handle: fileSession,
    sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
  }
}