'use strict';

let RedisSocket = think.adapter('socket', 'redis');

/**
 * redis cache
 */
export default class extends think.adapter.base {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options){

    options = this.mergeConfig(think.config('redis'), options);
    this.options = options;
    
    this.timeout = options.timeout;
    this.keyPrefix = options.prefix;
  }
  /**
   * get redis instance
   * @return {Object} []
   */
  getRedisInstance(name){

    let options = this.parseConfig(this.options, {
      command: name
    }, 'cache');

    let key = think.md5(JSON.stringify(options)).slice(0, 5);

    let instance = thinkCache(thinkCache.REDIS, key);
    if(!instance){
      instance = new RedisSocket(options);
      thinkCache(thinkCache.REDIS, key, instance);
    }

    return instance;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    let instance = this.getRedisInstance('get');
    return instance.get(this.keyPrefix + name).then(value => {
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
    let instance = this.getRedisInstance('set');
    return instance.set(this.keyPrefix + name, JSON.stringify(value), timeout).catch(() => {});
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    let instance = this.getRedisInstance('delete');
    return instance.delete(this.keyPrefix + name).catch(() => {});
  }
  /**
   * wrap
   * @param  {[type]}    name []
   * @param  {...[type]} data []
   * @return {[type]}         []
   */
  wrap(command, name, ...data){
    let instance = this.getRedisInstance(command);
    return instance.wrap(command, this.keyPrefix + name, ...data);
  }
}