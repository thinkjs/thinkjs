'use strict';

import path from 'path';
/**
 * session configs
 */
export default {
  name: 'thinkjs',
  type: 'file',
  secret: '',
  timeout: 24 * 3600,
  cookie: { // cookie options
    length: 32
  },
  adapter: {
    file: {
      path: think.RUNTIME_PATH + path.sep + 'session'
    }
  }
};