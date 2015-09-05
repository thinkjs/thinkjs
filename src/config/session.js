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
  auth_key: 'think_auth_list',
  timeout: 24 * 3600,
  cookie: { // cookie options
    length: 32
  }
};