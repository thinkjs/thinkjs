'use strict';
/**
 * base store
 * @type {Class}
 */
let BaseStore = think.adapter('store', 'memory');
/**
 * memory cache
 */
export default class extends think.adapter.base {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options){

    options = think.parseConfig(think.config('cache'), options);

    this.timeout = options.timeout;

    this.store = new BaseStore({
      type: thinkCache.MEMORY
    });
    
    //set gc type & start gc
    this.gcType = 'cache_memory';
    think.gc(this);
  }
  /**
   * get session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.store.get(name).then(data => {
      if(!data){
        return;
      }
      //data is expire
      if(data.expire && Date.now() > data.expire){
        return this.store.delete(name);
      }
      return think.clone(data.data);
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
    let data = {
      expire: timeout > 0 ? (Date.now() + timeout * 1000) : null,
      timeout,
      data: value
    };
    return this.store.set(name, data);
  }
  /**
   * delete session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.store.delete(name);
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
        if(item && item.expire && now > item.expire){
          delete list[key];
        }
      }
    });
  }
}
