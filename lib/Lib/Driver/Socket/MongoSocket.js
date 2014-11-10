'use strict';

var mongoose = require('mongoose');
module.exports = Class({
  init: function(config){
    this.handle = null;
    this.deferred = null;
    this.config = config;
    this.mongoose = mongoose;
  },
  /**
   * 连接，虽然mongoose在连接之前会缓存所有的执行命令
   * 但为了后续切换需要，这里通过Promise来保证连接后才执行命令
   * @return {[type]} [description]
   */
  connect: function(){
    if (this.handle) {
      return this.deferred.promise;
    }
    var self = this;
    var deferred = getDefer();
    //创建连接
    var config = extend({
      db_host: '127.0.0.1',
      db_port: 27017,
    }, this.config);
    config = 'mongodb://' + config.db_host + ':' + config.db_port + '/' + config.db_name;
    var connection = mongoose.createConnection(config);
    connection.on('open', function(){
      deferred.resolve(connection);
    });
    connection.on('error', function(){
      self.close();
    })
    //连接句柄
    this.handle = connection;
    //把上一次的promise reject
    if (this.deferred) {
      this.deferred.reject(new Error('connection closed'));
    }
    this.deferred = deferred;
    return this.deferred.promise;
  },
  /**
   * 关闭连接
   * @return {[type]} [description]
   */
  close: function(){
    if (this.handle) {
      this.handle.destroy();
      this.handle = null;
    }
  }
})