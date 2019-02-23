'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


for(var filepath in require.cache){
  delete require.cache[filepath];
}
var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var redisSocket = think.adapter('socket', 'redis');

describe('adapter/socket/redis', function(){
  it('get instance', function(){
    var instance = new redisSocket();
    assert.deepEqual(instance.config, { port: 6379, host: '127.0.0.1', password: '' });
  })
  it('get connection', function(done){
    var npm = think.npm;
    var wait = think.await;
    think.npm = function(){
      return {
        createClient: function(port, host, config){
          assert.equal(port, 6379);
          assert.equal(host, '127.0.0.1');
          return {
            on: function(type, callback){
              if(type === 'connect'){
                callback && callback();
              }
            }
          }
        }
      }
    }
    think.await = function(str, callback){
      assert.equal(str, 'redis://127.0.0.1:6379');
      return callback && callback();
    }
    var instance = new redisSocket();
    instance.getConnection().then(function(connection){
      think.npm = npm;
      think.await = wait;
      done();
    })
  }),
  it('get connection, change host & port', function(done){
    var npm = think.npm;
    var wait = think.await;
    think.npm = function(){
      return {
        createClient: function(port, host, config){
          assert.equal(port, 1234);
          assert.equal(host, 'www.welefen.com');
          return {
            on: function(type, callback){
              if(type === 'connect'){
                callback && callback();
              }
            }
          }
        }
      }
    }
    think.await = function(str, callback){
      assert.equal(str, 'redis://www.welefen.com:1234');
      return callback && callback();
    }
    var instance = new redisSocket({
      host: 'www.welefen.com',
      port: 1234
    });
    instance.getConnection().then(function(connection){
      think.npm = npm;
      think.await = wait;
      done();
    })
  }),
  it('get connection, has password', function(done){
    var npm = think.npm;
    var wait = think.await;
    think.npm = function(){
      return {
        createClient: function(port, host, config){
          assert.equal(port, 1234);
          assert.equal(host, 'www.welefen.com');
          return {
            on: function(type, callback){
              if(type === 'connect'){
                callback && callback();
              }
            },
            auth: function(password, callback){
              assert.equal(password, 'password');
              callback && callback();
            }
          }
        }
      }
    }
    think.await = function(str, callback){
      assert.equal(str, 'redis://www.welefen.com:1234');
      return callback && callback();
    }
    var instance = new redisSocket({
      host: 'www.welefen.com',
      port: 1234,
      password: 'password'
    });
    instance.getConnection().then(function(connection){
      think.npm = npm;
      think.await = wait;
      done();
    })
  })
  it('get connection, error', function(done){
    var npm = think.npm;
    var wait = think.await;
    var reject = think.reject;
    think.npm = function(){
      return {
        createClient: function(port, host, config){
          assert.equal(port, 1234);
          assert.equal(host, 'www.welefen.com');
          return {
            on: function(type, callback){
              if(type === 'error'){
                callback && callback(new Error('redis get connection error'));
              }
            },
            auth: function(password, callback){
              assert.equal(password, 'password');
              callback && callback();
            }
          }
        }
      }
    }
    think.await = function(str, callback){
      assert.equal(str, 'redis://www.welefen.com:1234');
      return callback && callback();
    }
    think.reject = function(err){
      return Promise.reject(err);
    }
    var instance = new redisSocket({
      host: 'www.welefen.com',
      port: 1234,
      password: 'password'
    });
    instance.getConnection().catch(function(err){
      assert.equal(err.message, 'redis get connection error');
      assert.equal(instance.connection, null);
      think.npm = npm;
      think.await = wait;
      think.reject = reject;
      done();
    })
  })
  it('get connection, error 1', function(done){
    var npm = think.npm;
    var wait = think.await;
    var reject = think.reject;
    think.npm = function(){
      return {
        createClient: function(port, host, config){
          assert.equal(port, 1234);
          assert.equal(host, 'www.welefen.com');
          return {
            on: function(type, callback){
              if(type === 'error'){
                callback && callback(new Error('EADDRNOTAVAIL'));
              }
            },
            auth: function(password, callback){
              assert.equal(password, 'password');
              callback && callback();
            }
          }
        }
      }
    }
    think.await = function(str, callback){
      assert.equal(str, 'redis://www.welefen.com:1234');
      return callback && callback();
    }
    think.reject = function(err){
      return Promise.reject(err);
    }
    var instance = new redisSocket({
      host: 'www.welefen.com',
      port: 1234,
      password: 'password'
    });
    instance.getConnection().catch(function(err){
      assert.equal(err.message, 'Address not available, redis://www.welefen.com:1234. http://www.thinkjs.org/doc/error_message.html#eaddrnotavail');
      assert.equal(instance.connection, null);
      think.npm = npm;
      think.await = wait;
      think.reject = reject;
      done();
    })
  })
  it('get connection, exist', function(done){
    var instance = new redisSocket({
      host: 'www.welefen.com',
      port: 1234,
      password: 'password'
    });
    instance.connection = 'welefen';
    instance.getConnection().then(function(connection){
      assert.equal(connection, 'welefen')
      done();
    })
  })
  it('get connection, fail', function(done){
    var instance = new redisSocket({
      host: 'www.welefen.com',
      port: 1234,
      password: 'password'
    });
    var npm = think.npm;
    think.npm = function(){
      return Promise.reject(new Error('reject'));
    }
    instance.getConnection().catch(function(err){
      think.npm = npm;
      assert.equal(err.message, 'reject')
      done();
    })
  })
  it('on', function(done){
    var instance = new redisSocket();
    instance.getConnection = function(){
      return Promise.resolve({
        on: function(event, callback){
          assert.equal(event, 'test');
          assert.equal(think.isFunction(callback), true);
        }
      })
    }
    instance.on('test', function(){}).then(function(){
      done();
    })
  })
  it('wrap', function(done){
    var instance = new redisSocket();
    instance.getConnection = function(){
      var obj = {
        get: function(key, callback){
          assert.equal(key, 'key');
          callback && callback();
        }
      }
      instance.connection = obj;
      return Promise.resolve(obj);
    }
    instance.wrap('get', 'key').then(function(){
      done();
    })
  })
  it('wrap reject', function(done){
    var instance = new redisSocket();
    var reject = think.reject;
    think.reject = function(err){
      return Promise.reject(err);
    }
    instance.getConnection = function(){
      var obj = {
        get: function(key, callback){
          assert.equal(key, 'key');
          callback && callback(new Error('redis wrap error'));
        }
      }
      instance.connection = obj;
      return Promise.resolve(obj);
    }
    instance.wrap('get', 'key').catch(function(err){
      assert.equal(err.message, 'redis wrap error');
      think.reject = reject;
      done();
    })
  })
  it('get', function(done){
    var instance = new redisSocket();
    instance.getConnection = function(){
      var obj = {
        get: function(key, callback){
          assert.equal(key, 'key');
          callback && callback();
        }
      }
      instance.connection = obj;
      return Promise.resolve(obj);
    }
    instance.get('key').then(function(){
      done();
    })
  })
  it('set', function(done){
    var instance = new redisSocket();
    instance.getConnection = function(){
      var obj = {
        set: function(key, value, callback){
          assert.equal(key, 'key');
          assert.equal(value, 'value');
          callback && callback();
        }
      }
      instance.connection = obj;
      return Promise.resolve(obj);
    }
    instance.set('key', 'value').then(function(){
      done();
    })
  }),
  it('set, timeout', function(done){
    var instance = new redisSocket();
    instance.getConnection = function(){
      var obj = {
        set: function(key, value, callback){
          assert.equal(key, 'key');
          assert.equal(value, 'value');
          callback && callback();
        },
        expire: function(key, timeout, callback){
          assert.equal(timeout, 10000);
          callback && callback();
        }
      }
      instance.connection = obj;
      return Promise.resolve(obj);
    }
    instance.set('key', 'value', 10000).then(function(){
      done();
    })
  })
  it('delete', function(done){
    var instance = new redisSocket();
    instance.getConnection = function(){
      var obj = {
        del: function(key, callback){
          assert.equal(key, 'key');
          callback && callback();
        }
      }
      instance.connection = obj;
      return Promise.resolve(obj);
    }
    instance.delete('key').then(function(){
      done();
    })
  })
  it('close', function(){
    var instance = new redisSocket();
    var flag = false;
    instance.connection = {
      end: function(){
        flag = true;
      }
    }
    instance.close();
    assert.equal(flag, true);
  })
})