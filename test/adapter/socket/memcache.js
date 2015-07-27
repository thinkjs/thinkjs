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

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var memcacheSocket = think.adapter('socket', 'memcache');

describe('adapter/socket/memcache.js', function(){
  it('get instance', function(){
    var instance = new memcacheSocket();
    assert.deepEqual(instance.config, { host: '127.0.0.1', port: 11211, username: '', password: '' });
  })
  it('getConnection', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, ':@127.0.0.1:11211');
          }
        }
      }
    })
    var instance = new memcacheSocket();
    instance.getConnection().then(function(){
      muk.restore();
      done();
    });
  })
  it('getConnection config', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.getConnection().then(function(){
      muk.restore();
      done();
    });
  })
  it('getConnection config', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@www.welefen.com:99999');
          }
        }
      }
    })
    var instance = new memcacheSocket({
      host: 'www.welefen.com',
      port: 99999,
      username: 'welefen',
      password: 'suredy'
    });
    instance.getConnection().then(function(){
      muk.restore();
      done();
    });
  })
  it('getConnection config, connection exist', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection'
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.getConnection().then(function(){
      muk.restore();
      return instance.getConnection();
    }).then(function(connection){
      assert.deepEqual(connection, {connection: 'connection'})
      done();
    })
  })
  it('get data', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              get: function(key, callback){
                callback && callback(null, 'suredy')
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.get('welefen').then(function(data){
      assert.deepEqual(data, 'suredy')
      muk.restore();
      done();
    })
  })
  it('get data', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              get: function(key, callback){
                callback && callback(null, new Buffer('suredy'))
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.get('welefen').then(function(data){
      assert.deepEqual(data, 'suredy')
      muk.restore();
      done();
    })
  })
  it('get data error', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              get: function(key, callback){
                callback && callback(new Error('suredy'))
              }
            }
          }
        }
      }
    });
    muk(think, 'reject', function(err){
      return Promise.reject(err);
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.get('welefen').catch(function(err){
      assert.deepEqual(err.message, 'suredy')
      muk.restore();
      done();
    })
  })
  it('set data', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              set: function(key, value, callback, timeout){
                assert.equal(key, 'welefen');
                assert.equal(value, 'suredy');
                assert.equal(timeout, 1000);
                callback && callback(null, new Buffer('suredy'))
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.set('welefen', 'suredy', 1000).then(function(){
      muk.restore();
      done();
    })
  })
  it('set data, timeout', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              set: function(key, value, callback, timeout){
                assert.equal(key, 'welefen');
                assert.equal(value, 'suredy');
                assert.equal(timeout, 0);
                callback && callback(null, new Buffer('suredy'))
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy',
      timeout: 0
    });
    instance.set('welefen', 'suredy').then(function(){
      muk.restore();
      done();
    })
  })
  it('set data error', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              set: function(key, value, callback, timeout){
                assert.equal(key, 'welefen');
                assert.equal(value, 'suredy');
                assert.equal(timeout, 1000);
                callback && callback(new Error('memcache set data error'))
              }
            }
          }
        }
      }
    });
    muk(think, 'reject', function(err){
      return Promise.reject(err);
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.set('welefen', 'suredy', 1000).catch(function(){
      muk.restore();
      done();
    })
  })
  it('delete data', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              delete: function(key, callback){
                assert.equal(key, 'welefen');
                callback && callback(null)
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.delete('welefen').then(function(){
      muk.restore();
      done();
    })
  })
  it('delete data error', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              delete: function(key, callback){
                assert.equal(key, 'welefen');
                callback && callback(new Error('memcache delete data error'))
              }
            }
          }
        }
      }
    });
    muk(think, 'reject', function(err){
      return Promise.reject(err)
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.delete('welefen').catch(function(err){
      assert.equal(err.message, 'memcache delete data error')
      muk.restore();
      done();
    })
  })
  it('increment', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              increment: function(key, amount, callback){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                callback && callback()
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.increment('welefen', 1000).then(function(){
      muk.restore();
      done();
    })
  })
  it('increment timeout', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              increment: function(key, amount, callback, timeout){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                assert.equal(timeout, 2000)
                callback && callback()
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.increment('welefen', 1000, 2000).then(function(){
      muk.restore();
      done();
    })
  })
  it('increment error', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              increment: function(key, amount, callback){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                callback && callback(new Error('increment error'))
              }
            }
          }
        }
      }
    });
    muk(think, 'reject', function(err){
      return Promise.reject(err);
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.increment('welefen', 1000).catch(function(){
      muk.restore();
      done();
    })
  })
  it('decrement', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              decrement: function(key, amount, callback){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                callback && callback()
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.decrement('welefen', 1000).then(function(){
      muk.restore();
      done();
    })
  })
  it('decrement timeout', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              decrement: function(key, amount, callback, timeout){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                assert.equal(timeout, 2000)
                callback && callback()
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.decrement('welefen', 1000, 2000).then(function(){
      muk.restore();
      done();
    })
  })
  it('decrement error', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              decrement: function(key, amount, callback){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                callback && callback(new Error('descrement error'))
              }
            }
          }
        }
      }
    });
    muk(think, 'reject', function(err){
      return Promise.reject(err);
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.decrement('welefen', 1000).catch(function(){
      muk.restore();
      done();
    })
  })
  it('close', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              close: function(key, amount, callback){
                
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.close();
    muk.restore();
    done();
  })
  it('close', function(done){
    muk(think, 'npm', function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              close: function(key, amount, callback){
                
              }
            }
          }
        }
      }
    })
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.getConnection().then(function(){
      instance.close();
      muk.restore();
      done();
    })
    
  })
})
