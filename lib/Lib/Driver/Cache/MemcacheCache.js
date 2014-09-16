var memcache = thinkRequire('MemcacheSocket');
module.exports = Cache(function(){
  'use strict';
  /**
   * 同一份配置只有一个连接
   * @type {Object}
   */
  var instances = {};

  return {
    /**
     * key前缀
     * @type {[type]}
     */
    namePrefix: C('cache_key_prefix'),
    /**
     * 初始化
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    init: function(options){
      this.super_('init', options);
      var key = JSON.stringify(options);
      if (!(key in instances)) {
        instances[key] = memcache(C('memcache_port'), C('memcache_host'));
      }
      this.handle = instances[key];
    },
    /**
     * 获取
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get: function(name){
      return this.handle.get(this.namePrefix + name).then(function(value){
        return value ? JSON.parse(value) : value;
      })
    },
    /**
     * 设置
     * @param {[type]} name    [description]
     * @param {[type]} value   [description]
     * @param {[type]} timeout [description]
     */
    set: function(name, value, timeout){
      timeout = timeout || this.options.timeout;
      return this.handle.set(this.namePrefix + name, JSON.stringify(value), timeout);
    },
    /**
     * 删除
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    rm: function(name){
      return this.handle.delete(this.namePrefix + name);
    }
  };
});