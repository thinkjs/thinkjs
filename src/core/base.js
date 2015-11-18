'use strict';

import path from 'path';

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
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
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(){
    
  }
  /**
   * before magic method
   * @return {} []
   */
  __before(){

  }
  /**
   * after magic method
   * @return {} []
   */
  __after(){

  }
  /**
   * invoke method, support __before & __after magic methods
   * @param  {String} method []
   * @param  {mixed} data []
   * @return {Promise}    []
   */
  async invoke(method, ...data){
    if (think.isFunction(this.__before)) {
      await think.co(this.__before(this));
      //await think.co.wrap(this.__before).bind(this)(this);
    }
    let result = await think.co(this[method](...data));
    //let result = await think.co.wrap(this[method]).apply(this, data);
    if (think.isFunction(this.__after)) {
      await think.co(this.__after(this));
      //await think.co.wrap(this.__after).bind(this)(this);
    }
    return result;
  }
  /**
   * get current class filename
   * @return {} []
   */
  parseFilename(filename){
    filename = filename || this.__filename;
    let filenames = filename.split(path.sep).reverse();
    let basename = filenames[0].slice(0, -3);
    let module;
    switch(think.mode){
      case think.mode_module:
        module = filenames[2];
        break;
      case think.mode_normal:
        module = filenames[1];
        break;
      default:
        module = think.config('default_module');
    }
    return {
      module,
      basename
    };
  }
}