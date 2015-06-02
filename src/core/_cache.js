'use strict';

/**
 * global memory cache
 * @type {Object}
 */
global.thinkCache = (type, name, value) => {
  type = '_' + type;
  if (!(type in thinkCache)) {
    thinkCache[type] = {};
  }
  // get cache
  if (name === undefined) {
    return thinkCache[type];
  }
  // get cache
  else if (value === undefined) {
    if (think.isString(name)) {
      return thinkCache[type][name];
    }
    thinkCache[type] = name;
    return;
  }
  //remove cache
  else if (value === null) {
    delete thinkCache[type][name];
    return;
  }
  //set cache
  thinkCache[type][name] = value;
};
/**
 * cache type
 * @type {String}
 */
/**
 * base
 * @type {String}
 */
thinkCache.BASE = 'base';
/**
 * [TEMPLATE description]
 * @type {String}
 */
thinkCache.TEMPLATE = 'template';
/**
 * [VIEW description]
 * @type {String}
 */
thinkCache.VIEW = 'view';
/**
 * [DB description]
 * @type {String}
 */
thinkCache.DB = 'db';
/**
 * [TABLE description]
 * @type {String}
 */
thinkCache.TABLE = 'table';
/**
 * [SESSION description]
 * @type {String}
 */
thinkCache.SESSION = 'session';
/**
 * [REDIS description]
 * @type {String}
 */
thinkCache.REDIS = 'redis';
/**
 * [MEMCACHE description]
 * @type {String}
 */
thinkCache.MEMCACHE = 'memcache';
/**
 * [FILE description]
 * @type {String}
 */
thinkCache.FILE = 'file';