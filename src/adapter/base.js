'use strict';

/**
 * think.adapter.base class
 * all adapter will be inherit this class
 */
export default class extends think.base {
  /**
   * merge config
   * @param  {...[type]} conf []
   * @return {Object}         []
   */
  mergeConfig(...conf){
    return think.mergeConfig(...conf);
  }
}