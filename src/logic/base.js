'use strict';

/**
 * base logic
 * inherits from base controller
 * @type {Class}
 */
export default class extends think.controller.base {
  /**
   * check auth
   * @return {Promise} []
   */
  auth(){

  }
  /**
   * validate data
   * @param  {Object} data      []
   * @param  {String} validType []
   * @return {}           []
   */
  valid(data) {
    let ret = think.validate(data);
    if(!think.isEmpty(ret)){
      return this.fail(ret);
    }
  }
}