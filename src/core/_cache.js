'use strict';

/**
 * global memory cache
 * @type {Object}
 */
global.thinkCache = (type, name, value) => {
  type = `_${type}`;
  if (!(type in thinkCache)) {
    thinkCache[type] = {};
  }
  // get cache
  if (name === undefined) {
    return thinkCache[type];
  }
  //remove cache
  else if(name === null){
    thinkCache[type] = {};
    return;
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
 * memory cache
 * @type {String}
 */
thinkCache.MEMORY = 'memory';
/**
 * for store template file list
 * fast check template file is exist, no file io
 * @type {String}
 */
thinkCache.TEMPLATE = 'template';
/**
 * store controller/action template file
 * @type {String}
 */
thinkCache.VIEW = 'view';
/**
 * store db instance
 * @type {String}
 */
thinkCache.DB = 'db';
/**
 * store table info
 * @type {String}
 */
thinkCache.TABLE = 'table';
/**
 * memory session
 * @type {String}
 */
thinkCache.SESSION = 'session';
/**
 * store redis instance
 * @type {String}
 */
thinkCache.REDIS = 'redis';
/**
 * store memcache instance
 * @type {String}
 */
thinkCache.MEMCACHE = 'memcache';
/**
 * think config
 * @type {String}
 */
thinkCache.CONFIG = 'config';
/**
 * think module config
 * @type {String}
 */
thinkCache.MODULE_CONFIG = 'module_config';
/**
 * think alias
 * @type {String}
 */
thinkCache.ALIAS = 'alias';
/**
 * think alias_export
 * @type {String}
 */
thinkCache.ALIAS_EXPORT = 'alias_export';
/**
 * think middleware
 * @type {String}
 */
thinkCache.MIDDLEWARE = 'middleware';
/**
 * think timer
 * @type {String}
 */
thinkCache.TIMER = 'timer';
/**
 * file auto reload
 * @type {String}
 */
thinkCache.AUTO_RELOAD = 'auto_reload';
/**
 * think hook
 * @type {String}
 */
thinkCache.HOOK = 'hook';
/**
 * think validate
 * @type {String}
 */
thinkCache.VALIDATOR = 'validator';
/**
 * think collection class or function
 * @type {String}
 */
thinkCache.COLLECTION = 'collection';
/**
 * system error message
 * @type {String}
 */
thinkCache.ERROR = 'error';
/**
 * store websockets
 * @type {String}
 */
thinkCache.WEBSOCKET = 'websocket';
/**
 * store limit instance
 * @type {String}
 */
thinkCache.LIMIT = 'limit';
/**
 * app use
 * @type {String}
 */
thinkCache.APP = 'app';