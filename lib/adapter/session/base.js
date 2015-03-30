'use strict';

module.exports = think.Class({
  /**
   * gc type
   * @type {String}
   */
  gcType: thinkCache.SESSION,
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
    //cache key
    this.key = this.options.cookie;
  },
  /**
   * before method
   * @return {Object} [session data]
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
    var key = this.key || name;
    if (!(key in this.data)) {
      return;
    }
    var value = this.data[key];
    if (Date.now() > value.expire) {
      delete this.data[key];
      return;
    }
    this.data[key].expire = Date.now() + value.timeout * 1000;
    return this.clone(value);
  },
  /**
   * set session data
   * @param {String} name    [session key]
   * @param {mixed} value   [session value]
   * @param {Number} timeout [session timeout]
   */
  set: function(name, value, timeout){
    if (timeout === undefined) {
      timeout = this.options.timeout;
    }
    var key = this.key;
    value = this.clone(value);
    if (key in this.data) {
      this.data[key].data[name] = value;
    }else{
      this.data[key] = {
        data: think.getObject(name, value),
        timeout: timeout,
        expire: Date.now() + timeout * 1000
      };
    }
  },
  /**
   * remove session data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm: function(name){
    var key = this.key;
    if (key in this.data) {
      if (name) {
        delete this.data[key].data[name];
      }else{
        delete this.data[key];
      }
    }
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
}, true);
