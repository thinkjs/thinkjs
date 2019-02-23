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
    // Check whether method exists
    if (!this[method]){
      return Promise.reject(new Error(think.locale('METHOD_NOT_EXIST', method)));
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
  /**
   * parse module from filepath
   * @param  {String} filepath []
   * @return {String}          []
   */
  parseModuleFromPath(filepath = this.__filename){
    if (!filepath){
      return '';
    }
    if (think.mode !== think.mode_module){
      return '';
    }
    let prefix = think.APP_PATH + think.sep;
    let pos = filepath.indexOf(prefix);
    if (pos === -1){
      return '';
    }
    let nextPos = filepath.indexOf(think.sep, pos + prefix.length);
    if (nextPos === -1){
      return '';
    }
    let module = filepath.slice(pos + prefix.length, nextPos);
    if (think.module.indexOf(module) > -1){
      return module;
    }
    return '';
  }
}
