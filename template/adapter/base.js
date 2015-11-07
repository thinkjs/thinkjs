'use strict';

/**
 * base adapter
 * @return {Class}     []
 */
module.exports = think.adapter(think.adapter.base, {
  /**
   * init 
   * @return {} []
   */
  init: function(){
    this.super('init', arguments);
  }
});