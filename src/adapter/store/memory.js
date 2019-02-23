'use strict';
/**
 * store base class
 */
export default class extends think.adapter.base {
  /**
   * init
   * @return {} []
   */
  init(config){
    this.config = think.extend({
      type: thinkCache.MEMORY
    }, config);
    
    this.data = thinkCache(this.config.type);
  }
  /**
   * get content
   * @param  {String} key []
   * @return {Promise}     []
   */
  get(key){
    return Promise.resolve(this.data[key]);
  }
  /**
   * set key content
   * @param {} key     []
   * @param {} content []
   */
  set(key, content){
    this.data[key] = content;
    return Promise.resolve();
  }
  /**
   * delete key
   * @param  {String} key []
   * @return {}     []
   */
  delete(key){
    delete this.data[key];
    return Promise.resolve();
  }
  /**
   * get all data
   * @return {} []
   */
  list(){
    return Promise.resolve(this.data);
  }
}