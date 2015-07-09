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
    this.keyPrefix = options.prefix || 'thinkjs_';
    this.redis = new redisSocket(options);
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.redis.get(this.keyPrefix + name).then(value => {
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
      return this.redis.set(this.keyPrefix + name, JSON.stringify(value), timeout);
    } catch(e) {
      return Promise.resolve();
    }
  }
  /**
   * rm data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm(name){
    return this.redis.delete(this.keyPrefix + name);
  }
}