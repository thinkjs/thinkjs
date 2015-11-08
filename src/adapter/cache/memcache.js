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

    options = this.mergeConfig(think.config('memcache'), options);
    this.options = options;
    
    this.timeout = options.timeout;
    this.keyPrefix = options.prefix;
  }
  /**
   * get memcache instance
   * @param  {String} command []
   * @return {}         []
   */
  getMemcacheInstance(name){
    let options = this.parseConfig(this.options, {
      command: name
    }, 'cache');

    let key = think.md5(JSON.stringify(options)).slice(0, 5);

    let instance = thinkCache(thinkCache.MEMCACHE, key);
    if(!instance){
      instance = new MemcacheSocket(options);
      thinkCache(thinkCache.MEMCACHE, key, instance);
    }

    return instance;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    let instance = this.getMemcacheInstance('get');
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
    let instance = this.getMemcacheInstance('set');
    let data = JSON.stringify(value);
    return instance.set(this.keyPrefix + name, data, timeout).catch(() => {});
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    let instance = this.getMemcacheInstance('delete');
    return instance.delete(this.keyPrefix + name).catch(() => {});
  }
}