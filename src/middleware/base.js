'use strict';
/**
 * behavior abstract class
 * @return {} []
 */
module.exports = class extends think.base {
  /**
   * init
   * @return {} []
   */
  constructor(http) {
    super(http);
    if(this.options){
      //read config
      for (let key in this.options) {
        let value = this.config(key);
        if (value !== undefined) {
          this.options[key] = value;
        }
      }
    }
  }
  /**
   * run
   * @return {} []
   */
  run() {

  }
}