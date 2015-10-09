'use strict';

let runtimePrefix = think.getPath(undefined, think.dirname.runtime);

/**
 * cache configs
 */
export default {
  type: 'file',
  prefix: 'thinkjs_',
  timeout: 6 * 3600, //6 hours
  path: runtimePrefix + '/cache',
  path_depth: 2,
  file_ext: '.json'
};