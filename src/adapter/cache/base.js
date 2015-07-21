'use strict';
/**
 * memory cache
 */
export default class {
  /**
   * constructor
   * @param  {Object} args []
   * @return {}         []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    this.timeout = options.timeout;
    //all session data
    this.data = thinkCache(thinkCache.BASE);
    //set gc type & start gc
    this.gcType = 'cache_base';
    think.gc(this);
  }
  /**
   * get session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    let data = this.data[name];
    if (!data) {
      return Promise.resolve();
    }
    //data is expire
    if(data.expire && Date.now() > data.expire){
      delete this.data[name];
      return Promise.resolve();
    }
    let value = think.clone(data.data);
    return Promise.resolve(value);
  }
  /**
   * set session data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   * @return {Promise} []
   */
  set(name, value, timeout = this.timeout){
    value = think.clone(value);
    this.data[name] = {
      expire: timeout > 0 ? (Date.now() + timeout * 1000) : null,
      timeout,
      data: value
    };
    return Promise.resolve();
  }
  /**
   * delete session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    delete this.data[name];
    return Promise.resolve();
  }
  /**
   * gc
   * is internal method
   * @return {} []
   */
  gc(){
    let now = Date.now();
    for(let key in this.data){
      let item = this.data[key];
      if(item && item.expire && now > item.expire){
        delete this.data[key];
      }
    }
  }
}
