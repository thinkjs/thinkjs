'use strict';
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
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    this.timeout = options.timeout;
    //key is session cookie value
    this.cookie = options.cookie;
    //all session data
    this.data = thinkCache(thinkCache.SESSION);
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
    //cookie is not exist
    if(!(this.cookie in this.data)){
      return Promise.resolve();
    }
    let data = this.data[this.cookie];
    //data is expire
    if(Date.now() > data.expire){
      delete this.data[this.cookie];
      return Promise.resolve();
    }
    //update data expire
    this.data[this.cookie].expire = Date.now() + data.timeout * 1000;
    let value = name ? think.clone(data[name]) : think.clone(data);
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
