'use strict';

var memcache = think.adapter('socket', 'memcache');

module.exports = think.adapter({
  /**
   * gc type
   * @type {String}
   */
  gcType: '',
  /**
   * cache key prefix
   * @type {String}
   */
  keyPrefix: '',
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init: function(options){
    this.super('init', options);
    this.keyPrefix = this.options.prefix;
    
    //merge options
    this.options = think.extend({
      port: think.config('memcache.port'),
      host: think.config('memcache.host')
    }, this.options);

    var instances = thinkCache(thinkCache.MEMCACHE);

    var key = think.md5(JSON.stringify(this.options));
    if (!(key in instances)) {
      instances[key] = memcache(this.options.port, this.options.host);
    }
    this.handle = instances[key];
  },
  /**
   * get cache data
   * @param  {String} name [cache key]
   * @return {Promise}      []
   */
  get: function(name){
    return this.handle.get(this.keyPrefix + name).then(function(value){
      return value ? JSON.parse(value) : value;
    })
  },
  /**
   * set cache data
   * @param {String} name    [cache key]
   * @param {mixed} value   [cache value]
   * @param {Number} timeout [cache timeout]
   */
  set: function(name, value, timeout){
    timeout = timeout || this.options.timeout;
    return this.handle.set(this.keyPrefix + name, JSON.stringify(value), timeout);
  },
  /**
   * remove cache data
   * @param  {String} name [cache key]
   * @return {Promise}      []
   */
  rm: function(name){
    return this.handle.delete(this.keyPrefix + name);
  }
});