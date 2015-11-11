'use strict';

/**
 * think.adapter.base class
 * all adapter will be inherit this class
 */
export default class extends think.base {
  /**
   * parse config when config has parser function
   * @param  {Object} config []
   * @param  {Object} extra  []
   * @param  {String} type   []
   * @return {Object}        []
   */
  parseConfig(...configs){
    return think.parseConfig(...configs);
  }
}