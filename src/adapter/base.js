'use strict';

/**
 * think.adapter.base class
 * all adapter will be inherit this class
 */
export default class extends think.base {
  /**
   * merge config when has adapter config
   * @param  {...[type]} conf []
   * @return {Object}         []
   */
  mergeConfig(...conf){
    return think.mergeConfig(...conf);
  }
  /**
   * parse config when config has parser function
   * @param  {Object} config []
   * @param  {Object} extra  []
   * @param  {String} type   []
   * @return {Object}        []
   */
  parseConfig(config = {}, extra, type){
    if(!think.isFunction(config.parser)){
      return config;
    }
    if(think.isString(extra)){
      type = extra;
      extra = undefined;
    }
    if(think.isEmpty(extra)){
      return config.parser(config, type);
    }
    return config.parser(think.extend({}, config, extra), type);
  }
}