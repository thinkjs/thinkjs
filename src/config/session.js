'use strict';

let runtimePrefix = think.getPath(undefined, think.dirname.runtime);

/**
 * session configs
 */
export default {
  name: 'thinkjs',
  type: 'file',
  path: runtimePrefix + '/session',
  secret: '',
  timeout: 24 * 3600,
  cookie: { // cookie options
    length: 32
  }
};