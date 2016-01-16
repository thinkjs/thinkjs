'use strict';
/**
 * base service
 * @type {Class}
 */
export default class extends think.base {
  /**
   * get model instance
   * @return {} []
   */
  model(name, options, module){
    if(think.isString(options) && think.module.indexOf(options) > -1){
      module = options;
      options = {};
    }
    if(!module){
      let filename = this.__filename || __filename;
      let seps = filename.split(think.sep).reverse();
      module = seps[2];
    }
    if(think.isString(options)){
      options = {type: options};
    }
    options = think.extend({}, think.config('db', undefined, module), options);
    return think.model(name, options, module);
  }
}