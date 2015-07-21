'use strict';

let memcacheSocket = think.adapter('socket', 'memcache');

/**
 * store memcache socket instances
 * @type {Object}
 */
let instances = thinkCache(thinkCache.MEMCACHE);

/**
 * memcache cache
 */
export default class extends think.adapter.cache {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    options = think.extend({}, think.config('memcache'), options);
    this.timeout = options.timeout;
    this.keyPrefix = options.prefix;

    let key = think.md5(JSON.stringify(options));
    if (!(key in instances)) {
      instances[key] = new memcacheSocket(options.host, options.port);
    }
    this.memcache = instances[key];
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.memcache.get(this.keyPrefix + name).then(value => {
      try {
        if (value) {
          value = JSON.parse(value);
        }
        return Promise.resolve(value);
      } catch(e) {
        return Promise.resolve();
      }
    });
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.timeout){
    if (think.isObject(name)) {
      timeout = value;
      let key = Object.keys(name)[0];
      value = name[key];
      name = key;
    }
    try {
      return this.memcache.set(this.keyPrefix + name, JSON.stringify(value), timeout);
    } catch(e) {
      return Promise.resolve();
    }
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.memcache.delete(this.keyPrefix + name);
  }
}