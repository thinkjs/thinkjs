'use strict';

module.exports = think.adapter('[ADAPTER_TYPE]', 'base', {
  /**
   * init
   * @return {} []
   */
  init: function(){
    this.super('init', arguments);
  }
});