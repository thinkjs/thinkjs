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
    module = module || this.parseModuleFromPath();
    if(think.isString(options)){
      options = {type: options};
    }
    options = think.extend({}, think.config('db', undefined, module), options);
    return think.model(name, options, module);
  }
  /**
   * get service
   * @return {} []
   */
  service(name, module){
    module = module || this.parseModuleFromPath();
    return think.service(name, module);
  }
}