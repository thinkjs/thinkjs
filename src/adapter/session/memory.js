'use strict';

/**
 * base store
 * @type {Class}
 */
let BaseStore = think.adapter('store', 'memory');

/**
 * memory session
 */
export default class extends think.adapter.base {
  /**
   * init 
   * @param  {Object} config []
   * @return {}         []
   */
  init(options){

    options = think.parseConfig(think.config('session'), options);

    this.timeout = options.timeout;
    //key is session cookie value
    this.cookie = options.cookie;
    //store
    this.store = new BaseStore({
      type: thinkCache.SESSION
    });
    //set gc type & start gc
    this.gcType = 'session_base';
    think.gc(this);
  }
  /**
   * get session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.store.get(this.cookie).then(data => {
      if(!data){
        return;
      }
      if(Date.now() > data.expire){
        return this.store.delete(this.cookie);
      }
      data.expire = Date.now() + this.timeout * 1000;
      let value = data.data;
      if(name){
        return think.clone(value[name]);
      }
      return think.clone(value);
    });
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
    return this.store.get(this.cookie).then(data => {
      data = data || {};
      data = think.extend({}, data, {
        expire: Date.now() + timeout * 1000,
        timeout,
        data: {
          [name]: value
        }
      });
      return this.store.set(this.cookie, data);
    });
  }
  /**
   * delete session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.store.get(this.cookie).then(data => {
      if(!data){
        return;
      }
      if(!name){
        return this.store.delete(this.cookie);
      }
      delete data.data[name];
    });
  }
  /**
   * gc
   * is internal method
   * @return {} []
   */
  gc(){
    let now = Date.now();
    return this.store.list().then(list => {
      for(let key in list){
        let item = list[key];
        if(item && now > item.expire){
          delete list[key];
        }
      }
    });
  }
}
