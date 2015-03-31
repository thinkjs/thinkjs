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
   * @param {String} [name] [cache name]
   * @return {Promise} []
   */
  __before: function(name){
    var data = this._data = thinkCache(this.gcType);
    if (data) {
      this.data = data[name];
    }
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
    if (!this.data) {
      return;
    }
    if (Date.now() > this.data.expire) {
      delete this._data[name];
      return;
    }
    return this.clone(this.data);
  },
  /**
   * set cache data
   * @param {String} name    [cache key]
   * @param {mixed} value   [cache value]
   * @param {Number} timeout [cache timeout]
   */
  set: function(name, value, timeout){
    timeout = timeout || this.options.timeout;
    value = this.clone(value);
    if (this.data) {
      this.data.data = value;
    }else{
      this._data[name] = {
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
    if (this._data) {
      delete this._data[name];
    }
  },
  /**
   * gc
   * @param  {Number} now [now time]
   * @return {}     []
   */
  gc: function(now){
    now = now || Date.now();
    for(var key in this._data){
      var item = this._data[key];
      if (item && now > item.expire) {
        delete this._data[key];
      }
    }
  }
}, true)