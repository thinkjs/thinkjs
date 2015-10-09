'use strict';

let redisSocket = think.adapter('socket', 'redis');

/**
 * redis cache
 */
export default class extends think.adapter.cache {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    options = think.extend({}, think.config('redis'), options);
    this.timeout = options.timeout;
    this.keyPrefix = options.prefix;

    let key = think.md5(JSON.stringify(options));
    let instance = thinkCache(thinkCache.REDIS, key);
    if (!instance) {
      instance = new redisSocket(options);
      thinkCache(thinkCache.REDIS, key, instance);
    }
    this.redis = instance;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.redis.get(this.keyPrefix + name).then(value => {
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
    return this.redis.set(this.keyPrefix + name, JSON.stringify(value), timeout).catch(() => {});
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.redis.delete(this.keyPrefix + name).catch(() => {});
  }
}