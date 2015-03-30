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
      this.data = thinkCache(this.gcType);
      think.gc(this);
    }
    //cache key
    //in session mode, this.key is `thinkjs` cookie value. otherwise key equal cache name
    this.key = '';
    //auto update expire time
    //in sesson mode, it will be auto update
    this.updateExpire = this.options.updateExpire;
  },
  /**
   * get data
   * @param  {String} name [cache key]
   * @return {Promise}      []
   */
  get: function(name){
    var key = this.key || name;
    if (!(key in this.data)) {
      return Promise.resolve();
    }
    var value = this.data[key];
    if (Date.now() > value.expire) {
      delete this.data[key];
      return Promise.resolve();
    }
    if (this.updateExpire) {
      this.data[key].expire = Date.now() + value.timeout * 1000;
    }
    var data = value.data[name];
    if (think.isObject(data)) {
      data = think.extend({}, data);
    }else if (think.isArray(data)) {
      data = think.extend([], data);
    }
    return Promise.resolve(data);
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
    var key = this.key || name;
    if (think.isObject(value)) {
      value = think.extend({}, value);
    }else if (think.isArray(value)) {
      value = think.extend([], value);
    }
    if (key in this.data) {
      this.data[key].data[name] = value;
    }else{
      this.data[key] = {
        data: think.getObject(name, value),
        timeout: timeout,
        expire: Date.now() + timeout * 1000
      };
    }
    return Promise.resolve();
  },
  /**
   * remove cache data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm: function(name){
    var key = this.key || name;
    if (this.key) {
      if (key in this.data) {
        delete this.data[key].data[name];
      }
    }else{
      delete this.data[name];
    }
    return Promise.resolve();
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