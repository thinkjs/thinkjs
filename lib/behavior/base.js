'use strict';
/**
 * behavior abstract class
 * @return {} []
 */
module.exports = think.Class({
  /**
   * options
   * @type {Object}
   */
  options: {},
  /**
   * init
   * @return {} []
   */
  _init: function(){
    for(var key in this.options){
      var value = this.config(key);
      if (value !== undefined) {
        this.options[key] = value;
      }
    }
  },
  /**
   * run
   * @return {} []
   */
  run: function(){

  }
});