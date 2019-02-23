'use strict';

let MemcacheSocket = think.adapter('socket', 'memcache');

/**
 * memcache cache
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
   * get memcache instance
   * @param  {String} command []
   * @return {}         []
   */
  getMemcacheInstance(name){
    let options = think.parseConfig.call(this.options, think.config('memcache'), {
      command: name,
      from: 'cache'
    });
    this.timeout = options.timeout || this.timeout;
    this.prefix = options.prefix || this.prefix;
    return MemcacheSocket.getInstance(options, thinkCache.MEMCACHE, ['command', 'from']);
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    let instance = this.getMemcacheInstance('get');
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
    let instance = this.getMemcacheInstance('set');
    let data = JSON.stringify(value);
    return instance.set(this.prefix + name, data, timeout).catch(() => {});
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    let instance = this.getMemcacheInstance('delete');
    return instance.delete(this.prefix + name).catch(() => {});
  }
}