'use strict';

let memcacheSocket = think.adapter('socket', 'memcache');

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
    let instance = thinkCache(thinkCache.MEMCACHE, key);
    if (!instance) {
      instance = new memcacheSocket(options);
      thinkCache(thinkCache.MEMCACHE, key, instance);
    }
    this.memcache = instance;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.memcache.get(this.keyPrefix + name).then(value => {
      if (value) {
        return JSON.parse(value);
      }
    }).catch(() => {});
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.timeout){
    if (think.isObject(name)) {
      timeout = value || timeout;
      let key = Object.keys(name)[0];
      value = name[key];
      name = key;
    }
    return this.memcache.set(this.keyPrefix + name, JSON.stringify(value), timeout).catch(() => {});
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.memcache.delete(this.keyPrefix + name).catch(() => {});
  }
}