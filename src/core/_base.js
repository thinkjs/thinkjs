'use strict';
/**
 * base class
 */
export default class {
  /**
   * constructor
   * @param  {Object} http []
   * @return {}      []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init method, replace contructor 
   * @return {}      []
   */
  init(){
    
  }
  /**
   * invoke method, support __before & __after magic methods
   * @param  {String} method []
   * @param  {mixed} data []
   * @return {Promise}     []
   */
  async invoke(method, data = []){
    if (think.isFunction(this.__before)) {
      await think.co.wrap(this.__before).bind(this)(this);
    }
    let result = await think.co.wrap(this[method]).apply(this, data);
    if (think.isFunction(this.__after)) {
      await think.co.wrap(this.__after).bind(this)(this);
    }
    return result;
  }
}