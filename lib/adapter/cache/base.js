'use strict';

/**
 * cache base class
 * @return {} []
 */
module.exports = think.Class({
  /**
   * gc type
   * @type {String}
   */
  gcType: thinkCache.BASE,
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init: function(options){
    //merge default cache options
    this.options = think.extend({}, think.config('cache'), options);

    //set gc type
    if (this.options.gcType) {
      this.gcType = this.options.gcType;
    }
    // if gc type is set, register gc timer
    if (this.gcType) {
      think.gc(this);
    }
  },
  /**
   * get cache data
   * @return {Promise} []
   */
  __before: function(){
    this.data = thinkCache(this.gcType);
  },
  /**
   * clone data
   * @param  {Mixed} value [cache data]
   * @return {Mixed}       []
   */
  clone: function(value){
    if (think.isObject(value)) {
      return think.extend({}, value);
    }else if (think.isArray(value)) {
      return think.extend([], value);
    }
    return value;
  },
  /**
   * get data
   * @param  {String} name [cache key]
   * @return {Promise}      []
   */
  get: function(name){
    if (!(name in this.data)) {
      return;
    }
    var value = this.data[name];
    if (Date.now() > value.expire) {
      delete this.data[name];
      return;
    }
    return this.clone(value);
  },
  /**
   * set cache data
   * @param {String} name    [cache key]
   * @param {mixed} value   [cache value]
   * @param {Number} timeout [cache timeout]
   */
  set: function(name, value, timeout){
    if (timeout === undefined) {
      timeout = this.options.timeout;
    }
    value = this.clone(value);
    if (name in this.data) {
      this.data[name].data = value;
    }else{
      this.data[name] = {
        data: value,
        expire: Date.now() + timeout * 1000
      };
    }
  },
  /**
   * remove cache data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm: function(name){
    delete this.data[name];
  },
  /**
   * gc
   * @param  {Number} now [now time]
   * @return {}     []
   */
  gc: function(now){
    now = now || Date.now();
    for(var key in this.data){
      var item = this.data[key];
      if (item && now > item.expire) {
        delete this.data[key];
      }
    }
  }
}, true)