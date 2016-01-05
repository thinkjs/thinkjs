'use strict';

/**
 * global memory cache
 * @type {Object}
 */
global.thinkCache = (type, name, value) => {
  type = `_${type}`;
  if (!thinkCache[type]) {
    thinkCache[type] = {};
  }
  // get cache
  if (name === undefined) {
    return thinkCache[type];
  }
  //remove cache
  if(name === null){
    thinkCache[type] = {};
    return;
  }
  // get cache
  if (value === undefined) {
    if (think.isString(name)) {
      return thinkCache[type][name];
    }
    thinkCache[type] = name;
    return;
  }
  //remove cache
  if (value === null) {
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
 * store controller/action template file
 * @type {String}
 */
thinkCache.VIEW = 'view';
/**
 * store view content
 * @type {String}
 */
thinkCache.VIEW_CONTENT = 'view_content';
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
 * think collection class or function
 * @type {String}
 */
thinkCache.COLLECTION = 'collection';
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