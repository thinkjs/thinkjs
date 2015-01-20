/**
 * mysql socket
 * @return {[type]} [description]
 */

//暂时使用mysql库
var mysql = require('mysql');
module.exports = Class(function(){
  'use strict';
  return {
    init: function(config){
      this.handle = null;
      this.config = config;
      this.deferred = null;
      this.tryTimes = 0;
    },
    /**
     * 建立数据库连接
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
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: ''
      }, this.config);
      var connection = mysql.createConnection(config);
      //连接
      connection.connect(function(err){
        //连接失败
        if (err) {
          deferred.reject(err);
          self.close();
        }else{
          deferred.resolve();
        }
      });
      //错误时关闭当前连接
      connection.on('error', function(){
        self.close();
      });
      //PROTOCOL_CONNECTION_LOST
      connection.on('end', function(){
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
     * 查询sql语句，返回一个promise
     * @param  {[type]} sql [description]
     * @return {[type]}     [description]
     */
    query: function(sql){
      if (C('db_log_sql')) {
        console.log('sql: ' + sql);
      }
      var self = this;
      return this.connect().then(function(){
        var deferred = getDefer();
        self.handle.query(sql, function(err, rows){
          if (err) {
            //当数据量非常大时，可能会出现连接丢失，这里进行重连
            if (err.code === 'PROTOCOL_CONNECTION_LOST' && self.tryTimes < 3) {
              self.tryTimes++;
              self.close();
              return self.query(sql).then(function(data){
                deferred.resolve(data);
              }).catch(function(err){
                deferred.reject(err);
              })
            }
            return deferred.reject(err);
          }
          self.tryTimes = 0;
          return deferred.resolve(rows || []);
        });
        return deferred.promise;
      });
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
  };
});