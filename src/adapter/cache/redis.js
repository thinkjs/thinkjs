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
    this.options = think.parseConfig(think.config('cache'), options);
    this.timeout = this.options.timeout || 0;
    this.prefix = this.options.prefix || '';
  }
  /**
   * get redis instance
   * @return {Object} []
   */
  getRedisInstance(name){
    let options = think.parseConfig.call(this.options, think.config('redis'), {
      command: name,
      from: 'cache'
    });
    this.timeout = options.timeout || this.timeout;
    this.prefix = options.prefix || this.prefix;
    return RedisSocket.getInstance(options, thinkCache.REDIS, ['command', 'from']);
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    let instance = this.getRedisInstance('get');
    return instance.get(this.prefix + name).then(value => {
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
    return instance.set(this.prefix + name, JSON.stringify(value), timeout).catch(() => {});
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    let instance = this.getRedisInstance('delete');
    return instance.delete(this.prefix + name).catch(() => {});
  }
  /**
   * wrap
   * @param  {[type]}    name []
   * @param  {...[type]} data []
   * @return {[type]}         []
   */
  wrap(command, name, ...data){
    let instance = this.getRedisInstance(command);
    return instance.wrap(command, this.prefix + name, ...data);
  }
}