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
   * @return {Promise}     []
   */
  async invoke(method, ...data){
    if (think.isFunction(this.__before)) {
      await think.co.wrap(this.__before).bind(this)(this);
    }
    let result = await think.co.wrap(this[method]).apply(this, data);
    if (think.isFunction(this.__after)) {
      await think.co.wrap(this.__after).bind(this)(this);
    }
    return result;
  }
  /**
   * get current class filename
   * @return {} []
   */
  filename(){
    let filename = this.__filename || __filename;
    return path.basename(filename, '.js');
  }
  /**
   * merge config, support adapter config
   * @param  {} configs []
   * @return {}            []
   */
  mergeConfig(...configs){
    return think.mergeConfig(...configs);
  }
}