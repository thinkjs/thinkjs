/**
 * 文件Session
 * @return {[type]} [description]
 */

var os = require('os');
module.exports = Class(thinkRequire('FileCache'), function(){
  'use strict';
  return {
    gcType: 'FileSession',
    /**
     * 差异化的init
     * @return {[type]} [description]
     */
    init: function(options){
      options = options || {};
      options.cache_path = C('session_path') || (os.tmpdir() + '/thinkjs');
      this.super_('init', options);
      this.key = options.cookie;
      this.data = {};
    },
    /**
     * 初始化数据
     * @return {[type]} [description]
     */
    initData: function(){
      if (!this.promise) {
        var self = this;
        this.promise = this.getData().then(function(data){
          self.data = data || {};
          return self.data;
        })
      }
      return this.promise;
    },
    /**
     * 获取数据
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get: function(name){
      var self = this;
      return this.initData().then(function(){
        return self.data[name];
      });
    },
    /**
     * 设置数据
     * @param {[type]} name    [description]
     * @param {[type]} value   [description]
     * @param {[type]} timeout [description]
     */
    set: function(name, value, timeout){
      var self = this;
      return this.initData().then(function(){
        self.data[name] = value;
        if (timeout) {
          self.options.timeout = timeout;
        }
      });
    },
    /**
     * 删除数据
     * @return {[type]} [description]
     */
    rm: function(name){
      var self = this;
      return this.initData().then(function(){
        if (name) {
          delete self.data[name];
        }else{
          self.data = {};
        }
      })
    },
    /**
     * 将数据写入到文件中
     * @return {[type]} [description]
     */
    flush: function(){
      var self = this;
      return this.initData().then(function(){
        return self.setData(self.data);
      })
    }
  };
});