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
   * invoke method, support __before & __after magic methods
   * @param  {String} method []
   * @param  {mixed} data []
   * @return {Promise}    []
   */
  async invoke(method, ...data){
    if (this.__before) {
      await think.co(this.__before(this));
    }
    let result = await think.co(this[method](...data));
    if (this.__after) {
      await think.co(this.__after(this));
    }
    return result;
  }
  /**
   * get file basename
   * @param  {String} filepath []
   * @return {String}          []
   */
  basename(filepath = this.__filename){
    return path.basename(filepath, '.js');
  }
}