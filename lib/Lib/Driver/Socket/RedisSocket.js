var redis = require('redis');
module.exports = Class(function(){
  'use strict';
  return {
    init: function(config){
      this.config = extend({
        port: C('redis_port'),
        host: C('redis_host'),
        password: C('redis_password')
      }, config);
      this.handle = null;
      this.deferred = null;
    },
    connect: function(){
      if (this.handle) {
        return this.deferred.promise;
      }
      var self = this;
      var deferred = getDefer();
      var port = this.config.port || '6379';
      var host = this.config.host || '127.0.0.1';
      console.log('redis.createClient', host, port);
      var connection = redis.createClient(port, host, this.config);
      if (this.config.password) {
        connection.auth(this.config.password, function(){});
      }
      connection.on('ready', function(){
        deferred.resolve();
      })
      connection.on('connect', function(){
        deferred.resolve();
      })
      connection.on('error', function(){
        self.close();
      })
      connection.on('end', function(){
        self.close();
      })
      this.handle = connection;
      if (this.deferred) {
        this.deferred.reject(new Error('connection closed'));
      }
      this.deferred = deferred;
      return this.deferred.promise;
    },
    close: function(){
      if (this.handle) {
        this.handle.end();
        this.handle = null;
      }
    },
    wrap: function(name, data){
      var self = this;
      return this.connect().then(function(){
        var deferred = getDefer();
        if (!isArray(data)) {
          data = data === undefined ? [] : [data];
        }
        data.push(function(err, data){
          if (err) {
            deferred.reject(err);
          }else{
            deferred.resolve(data);
          }
        })
        self.handle[name].apply(self.handle, data);
        return deferred.promise;
      })
    },
    get: function(name){
      return this.wrap('get', [name]);
    },
    set: function(name, value){
      return this.wrap('set', [name, value]);
    }
  }
});