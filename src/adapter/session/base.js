'use strict';

/**
 * base store
 * @type {Class}
 */
let BaseStore = think.adapter('store', 'base');

/**
 * memory session
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
   * @param  {Object} config []
   * @return {}         []
   */
  init(config = {}){
    this.timeout = config.timeout;
    //key is session cookie value
    this.cookie = config.cookie;
    //store
    this.store = new BaseStore({
      type: thinkCache.SESSION
    })
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
      data.expire = Date.now() * date.timeout * 1000;
      let value = data.data;
      if(name){
        return think.clone(value[name]);
      }
      return think.clone(value);
    })
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
    let data;
    if(this.cookie in this.data){
      data = this.data[this.cookie].data;
      data[name] = value;
    }else{
      data = {
        [name]: value
      };
    }
    this.data[this.cookie] = {
      expire: Date.now() + timeout * 1000,
      timeout,
      data
    };
    return Promise.resolve();
  }
  /**
   * delete session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    if(this.cookie in this.data){
      if(name){
        delete this.data[this.cookie].data[name];
      }else{
        delete this.data[this.cookie];
      }
    }
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
      if(item && now > item.expire){
        delete this.data[key];
      }
    }
  }
}
