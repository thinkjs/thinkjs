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
  init: function(http){
    this.http = http;
    //read config from think._config
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