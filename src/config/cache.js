'use strict';

import path from 'path';

/**
 * cache configs
 */
export default {
  type: 'file', //cache type
  timeout: 6 * 3600, //6 hours
  adapter: {
    file: {
      path: think.RUNTIME_PATH + path.sep + 'cache',
      path_depth: 2,
      file_ext: '.json'
    },
    redis: {
      prefix: ''
    },
    memcache: {
      prefix: ''
    }
  }
};