var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var WebSocket = think.adapter('websocket', 'sockjs');

describe('adapter/websocket/sockjs.js', function(){
  it('init', function(){
    var server = {};
    var config = {};
    var app = {};
    var instance = new WebSocket(server, config, app);
    assert.equal(instance.server, server);
    assert.equal(instance.config, config);
    assert.equal(instance.app, app);
  })
  it('emit', function(){
    var server = {};
    var config = {};
    var app = {};
    var instance = new WebSocket(server, config, app);
    instance.socket = {
      write: function(data){
        assert.equal(data, '{"event":"event","data":"data"}');
      }
    }
    instance.emit('event', 'data');
  })
  it('broadcast', function(){
    var server = {};
    var config = {};
    var app = {};
    var flag = false;
    var instance = new WebSocket(server, config, app);
    instance.socket = {id: 111, write: function(data){
      flag = true;
      assert.equal(data, '{"event":"event","data":"data"}')
    }}
    thinkCache(thinkCache.WEBSOCKET, [instance.socket])
    instance.broadcast('event', 'data');
    assert.equal(flag, false);
  })
  it('broadcast, with self', function(){
    var server = {};
    var config = {};
    var app = {};
    var instance = new WebSocket(server, config, app);
    instance.socket = {id: 111, write: function(data){
      assert.equal(data, '{"event":"event","data":"data"}')
    }}
    thinkCache(thinkCache.WEBSOCKET, [instance.socket])
    instance.broadcast('event', 'data', true)
  })
  it('add socket', function(){
    var server = {};
    var config = {};
    var app = {};
    var flag = false;
    var instance = new WebSocket(server, config, app);
    thinkCache(thinkCache.WEBSOCKET, [])
    instance.addSocket({id: 1, write: function(){}});
    assert.equal(thinkCache(thinkCache.WEBSOCKET).length, 1);
  })
  it('remove socket', function(){
    var server = {};
    var config = {};
    var app = {};
    var flag = false;
    var instance = new WebSocket(server, config, app);
    thinkCache(thinkCache.WEBSOCKET, [])
    instance.addSocket({id: 1, write: function(){}});
    instance.removeSocket({id: 2})
    assert.equal(thinkCache(thinkCache.WEBSOCKET).length, 1);
  })
  it('remove socket 1', function(){
    var server = {};
    var config = {};
    var app = {};
    var flag = false;
    var instance = new WebSocket(server, config, app);
    thinkCache(thinkCache.WEBSOCKET, [])
    instance.addSocket({id: 1, write: function(){}});
    instance.removeSocket({id: 1})
    assert.equal(thinkCache(thinkCache.WEBSOCKET).length, 0);
  })
  it('mesage', function(done){
    var server = {};
    var config = {};
    var app = function(http){
      return {run: function(){
        assert.equal(http.data, 'data');
        assert.equal(think.isFunction(http.socketEmit), true)
        assert.equal(think.isFunction(http.socketBroadcast), true)
        assert.equal(http.url, '/open');
        assert.equal(think.isObject(http.socket), true);
        return Promise.resolve();
      }}
    };;
    var flag = false;
    var instance = new WebSocket(server, config, app);
    instance.message('open', 'data', {
      headers: {},
      remoteAddress: '100.200.100.200'
    }).then(function(data){
      done();
    });
  })
  it('mesage, url has /', function(done){
    var server = {};
    var config = {};
    var app = function(http){
      return {run: function(){
        assert.equal(http.data, 'data');
        assert.equal(think.isFunction(http.socketEmit), true)
        assert.equal(think.isFunction(http.socketBroadcast), true)
        assert.equal(http.url, '/open');
        assert.equal(think.isObject(http.socket), true);
        return Promise.resolve();
      }}
    };;
    var flag = false;
    var instance = new WebSocket(server, config, app);
    instance.message('/open', 'data', {
      headers: {},
      remoteAddress: '100.200.100.200'
    }).then(function(data){
      done();
    });
  })
  it('run', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(){
          return {
            on: function(type, callback){

            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/sockjs' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, sockjs_url', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(){
          return {
            on: function(type, callback){

            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/websocket' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {sockjs_url: '/websocket', path: '/websocket'};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, options', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(options){
          options.log();
          return {
            on: function(type, callback){

            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/websocket' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {sockjs_url: '/websocket', path: '/websocket'};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, connection', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(options){
          options.log();
          return {
            on: function(type, callback){
              assert.equal(type, 'connection');
              callback && callback({
                id: 1,
                write: function(){

                },
                on: function(ty, cb){
                  assert.equal(ty === 'data' || ty === 'close', true);
                  cb && cb();
                }
              });
            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/websocket' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {sockjs_url: '/websocket', path: '/websocket'};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, connection, open', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(options){
          options.log();
          return {
            on: function(type, callback){
              assert.equal(type, 'connection');
              callback && callback({
                id: 1,
                write: function(){

                },
                on: function(ty, cb){
                  assert.equal(ty === 'data' || ty === 'close', true);
                  cb && cb();
                }
              });
            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/websocket' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {sockjs_url: '/websocket', path: '/websocket', messages: {
      open: 'home/user/open'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.message = function(url, data, socket){
      assert.equal(url, 'home/user/open');
      assert.equal(data, undefined)
    }

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, connection, close', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(options){
          options.log();
          return {
            on: function(type, callback){
              assert.equal(type, 'connection');
              callback && callback({
                id: 1,
                write: function(){

                },
                on: function(ty, cb){
                  assert.equal(ty === 'data' || ty === 'close', true);
                  cb && cb();
                }
              });
            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/websocket' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {sockjs_url: '/websocket', path: '/websocket', messages: {
      close: 'home/user/close'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.message = function(url, data, socket){
      assert.equal(url, 'home/user/close');
      assert.equal(data, undefined)
    }

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, connection, has data', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(options){
          options.log();
          return {
            on: function(type, callback){
              assert.equal(type, 'connection');
              callback && callback({
                id: 1,
                write: function(){

                },
                on: function(ty, cb){
                  assert.equal(ty === 'data' || ty === 'close', true);
                  if(ty === 'data'){
                    cb && cb(JSON.stringify({event: 'test', data: 'data'}));
                  }else{
                    cb && cb();
                  }
                  
                }
              });
            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/websocket' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {sockjs_url: '/websocket', path: '/websocket', messages: {
      test: 'home/user/test'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.message = function(url, data, socket){
      assert.equal(url, 'home/user/test');
      assert.equal(data, 'data')
    }

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
it('run, connection, has data, no method', function(done){
    muk(think, 'npm', function(){
      return {
        createServer: function(options){
          options.log();
          return {
            on: function(type, callback){
              assert.equal(type, 'connection');
              callback && callback({
                id: 1,
                write: function(){

                },
                on: function(ty, cb){
                  assert.equal(ty === 'data' || ty === 'close', true);
                  if(ty === 'data'){
                    cb && cb(JSON.stringify({event: 'test', data: 'data'}));
                  }else{
                    cb && cb();
                  }
                  
                }
              });
            },
            installHandlers: function(ser, options){
              assert.deepEqual(options, { prefix: '/websocket' })
            }
          }
        }
      }
    })
    var server = {};
    var config = {sockjs_url: '/websocket', path: '/websocket', messages: {
      test1: 'home/user/test'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.message = function(url, data, socket){
      assert.equal(url, 'home/user/test');
      assert.equal(data, 'data')
    }

    instance.run().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  })
})