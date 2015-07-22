'use strict';

var assert = require('assert');
var thinkit = require('thinkit');
var path = require('path');


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
    var npm = think.npm;
    think.npm = function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, ':@127.0.0.1:11211');
          }
        }
      }
    }
    var instance = new memcacheSocket();
    instance.getConnection().then(function(){
      think.npm = npm;
      done();
    });
  })
  it('getConnection config', function(done){
    var npm = think.npm;
    think.npm = function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
          }
        }
      }
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.getConnection().then(function(){
      think.npm = npm;
      done();
    });
  })
  it('getConnection config, connection exist', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.getConnection().then(function(){
      think.npm = npm;
      return instance.getConnection();
    }).then(function(connection){
      assert.deepEqual(connection, {connection: 'connection'})
      done();
    })
  })
  it('get data', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.get('welefen').then(function(data){
      assert.deepEqual(data, 'suredy')
      think.npm = npm;
      done();
    })
  })
  it('get data', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.get('welefen').then(function(data){
      assert.deepEqual(data, 'suredy')
      think.npm = npm;
      done();
    })
  })
  it('get data error', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.get('welefen').catch(function(err){
      assert.deepEqual(err.message, 'suredy')
      think.npm = npm;
      done();
    })
  })
  it('set data', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.set('welefen', 'suredy', 1000).then(function(){
      think.npm = npm;
      done();
    })
  })
  it('set data, timeout', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy',
      timeout: 0
    });
    instance.set('welefen', 'suredy').then(function(){
      think.npm = npm;
      done();
    })
  })
  it('set data error', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
                callback && callback(new Error('error'))
              }
            }
          }
        }
      }
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.set('welefen', 'suredy', 1000).catch(function(){
      think.npm = npm;
      done();
    })
  })
  it('delete data', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.delete('welefen').then(function(){
      think.npm = npm;
      done();
    })
  })
  it('delete data error', function(done){
    var npm = think.npm;
    think.npm = function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              delete: function(key, callback){
                assert.equal(key, 'welefen');
                callback && callback(new Error('error'))
              }
            }
          }
        }
      }
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.delete('welefen').catch(function(err){
      assert.equal(err.message, 'error')
      think.npm = npm;
      done();
    })
  })
  it('increment', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.increment('welefen', 1000).then(function(){
      think.npm = npm;
      done();
    })
  })
  it('increment timeout', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.increment('welefen', 1000, 2000).then(function(){
      think.npm = npm;
      done();
    })
  })
  it('increment error', function(done){
    var npm = think.npm;
    think.npm = function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              increment: function(key, amount, callback){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                callback && callback(new Error(''))
              }
            }
          }
        }
      }
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.increment('welefen', 1000).catch(function(){
      think.npm = npm;
      done();
    })
  })
  it('decrement', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.decrement('welefen', 1000).then(function(){
      think.npm = npm;
      done();
    })
  })
  it('decrement timeout', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.decrement('welefen', 1000, 2000).then(function(){
      think.npm = npm;
      done();
    })
  })
  it('decrement error', function(done){
    var npm = think.npm;
    think.npm = function(name){
      return {
        Client: {
          create: function(str){
            assert.equal(str, 'welefen:suredy@127.0.0.1:11211');
            return {
              connection: 'connection',
              decrement: function(key, amount, callback){
                assert.equal(key, 'welefen');
                assert.equal(amount, 1000)
                callback && callback(new Error(''))
              }
            }
          }
        }
      }
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.decrement('welefen', 1000).catch(function(){
      think.npm = npm;
      done();
    })
  })
  it('close', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.close();
    think.npm = npm;
    done();
  })
  it('close', function(done){
    var npm = think.npm;
    think.npm = function(name){
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
    }
    var instance = new memcacheSocket({
      username: 'welefen',
      password: 'suredy'
    });
    instance.getConnection().then(function(){
      instance.close();
      think.npm = npm;
      done();
    })
    
  })
})
