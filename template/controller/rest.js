'use strict';
/**
 * rest controller
 * @type {Class}
 */
module.exports = think.controller('rest', {
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(http){
    this.super('init', http);
  },
  /**
   * before magic method
   * @return {Promise} []
   */
  __before: function(){
    
  }
});