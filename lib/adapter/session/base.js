'use strict'

var cache = think.adapter('cache', 'base');
module.exports = think.adapter(cache, {
  init: function(options){
    this.super_('init', options);
    this.key = this.options.cookie;
    this.updateExpire = true;
  }
});
