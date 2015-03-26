'use strict';

var cache = think.adapter('cache', 'base');
module.exports = think.adapter(cache, {
  /**
   * gc type
   * @type {String}
   */
  gcType: think.cache.session,
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init: function(options){
    this.super('init', options);
    this.key = this.options.cookie;
    this.updateExpire = true;
  }
});
