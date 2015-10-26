var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var WebSocket = think.adapter('websocket', 'socket.io');

describe('adapter/websocket/socket.io.js', function(){
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
      emit: function(event, data){
        assert.equal(event, 'event');
        assert.equal(data, 'data');
      }
    }
    instance.emit('event', 'data');
  })
  it('broadcast', function(){
    var server = {};
    var config = {};
    var app = {};
    var instance = new WebSocket(server, config, app);
    instance.socket = {
      broadcast: {
        emit: function(event, data){
          assert.equal(event, 'event');
          assert.equal(data, 'data');
        }
      }
    }
    instance.broadcast('event', 'data')
  })
  it('broadcast, contain self', function(){
    var server = {};
    var config = {};
    var app = {};
    var instance = new WebSocket(server, config, app);
    instance.io = {
      sockets: {
        emit: function(event, data){
          assert.equal(event, 'event');
          assert.equal(data, 'data');
        }
      }
    }
    instance.broadcast('event', 'data', true);
  })
  it('run', function(done){
    muk(think, 'npm', function(package){
      return function(ser){
        assert.equal(server, ser);
        return {
          sockets: {
            sockets: []
          },
          on: function(type, callback){
            assert.equal(type, 'connection');
            assert.equal(think.isFunction(instance.io.on), true)
            done();
          }
        }
      }
    })

    var server = {};
    var config = {};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, adapter', function(done){
    muk(think, 'npm', function(package){
      return function(ser){
        assert.equal(server, ser);
        return {
          sockets: {
            sockets: []
          },
          on: function(type, callback){
            assert.equal(type, 'connection');
            assert.equal(think.isFunction(instance.io.on), true);
            muk.restore();
            done();
          },
          adapter: function(data){
            assert.equal(data, 'adapter');
          }
        }
      }
    })

    var server = {};
    var config = {adapter: function(){
      return 'adapter'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, path', function(done){
    muk(think, 'npm', function(package){
      return function(ser){
        assert.equal(server, ser);
        return {
          sockets: {
            sockets: []
          },
          on: function(type, callback){
            assert.equal(type, 'connection');
            assert.equal(think.isFunction(instance.io.on), true);
            muk.restore();
            done();
          },
          path: function(data){
            assert.equal(data, 'path');
          }
        }
      }
    })

    var server = {};
    var config = {path: 'path'};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, allow_origin', function(done){
    muk(think, 'npm', function(package){
      return function(ser){
        assert.equal(server, ser);
        return {
          sockets: {
            sockets: []
          },
          on: function(type, callback){
            assert.equal(type, 'connection');
            assert.equal(think.isFunction(instance.io.on), true);
            muk.restore();
            done();
          },
          origins: function(data){
            assert.equal(data, 'www.thinkjs.org');
          }
        }
      }
    })

    var server = {};
    var config = {allow_origin: 'www.thinkjs.org'};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, collection 1', function(done){
    muk(think, 'npm', function(package){
      return function(ser){
        assert.equal(server, ser);
        return {
          sockets: {
            sockets: []
          },
          on: function(type, callback){
            assert.equal(type, 'connection');
            assert.equal(think.isFunction(instance.io.on), true);
            instance.message = function(message, data, socket){
              assert.equal(message, 'home/user/add');
              assert.equal(data, 'message');
              assert.equal(think.isFunction(socket.on), true)
            }
            callback && callback({
              on: function(key, cb){
                cb && cb('message');
              }
            });
            muk.restore();
            done();
          }
        }
      }
    })

    var server = {};
    var config = {messages: {
      user: 'home/user/add'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().catch(function(err){
      console.log(err.stack)
    });
  })
 it('run, collection, open', function(done){
    muk(think, 'npm', function(package){
      return function(ser){
        assert.equal(server, ser);
        return {
          sockets: {
            sockets: []
          },
          on: function(type, callback){
            assert.equal(type, 'connection');
            assert.equal(think.isFunction(instance.io.on), true);
            instance.message = function(message, data, socket){
              assert.equal(message, 'home/user/open');
              assert.equal(data, undefined);
              assert.equal(think.isFunction(socket.on), true)
            }
            callback && callback({
              on: function(key, cb){
                //cb && cb('message');
              }
            });
            muk.restore();
            done();
          }
        }
      }
    })

    var server = {};
    var config = {messages: {
      open: 'home/user/open',
      //user: 'home/user/add'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().catch(function(err){
      console.log(err.stack)
    });
  })
  it('run, collection, close', function(done){
    muk(think, 'npm', function(package){
      return function(ser){
        assert.equal(server, ser);
        return {
          sockets: {
            sockets: []
          },
          on: function(type, callback){
            assert.equal(type, 'connection');
            assert.equal(think.isFunction(instance.io.on), true);
            instance.message = function(message, data, socket){
              assert.equal(message, 'home/user/close');
              assert.equal(data, undefined);
              assert.equal(think.isFunction(socket.on), true)
            }
            callback && callback({
              on: function(key, cb){
                if(key === 'disconnect'){
                  cb();
                }
              }
            });
            muk.restore();
            done();
          }
        }
      }
    })

    var server = {};
    var config = {messages: {
      close: 'home/user/close',
      //user: 'home/user/add'
    }};
    var app = {};
    var instance = new WebSocket(server, config, app);

    instance.run().catch(function(err){
      console.log(err.stack)
    });
  })
  it('message', function(done){
    var server = {};
    var config = {};
    var app = function(http){
      return {run: function(){
        assert.equal(http.data, 'data');
        assert.equal(think.isFunction(http.socketEmit), true)
        assert.equal(think.isFunction(http.socketBroadcast), true)
        assert.equal(http.url, '/open');
        return Promise.resolve();
      }}
    };
    var instance = new WebSocket(server, config, app);
    instance.message('open', 'data', {request: {
      headers: {},
      res: {setTimeout: function(){}}}
    }).then(function(){
      done();
    }).catch(function(err){console.log(err.stack)})
  })
  it('message, url with /', function(done){
    var server = {};
    var config = {};
    var app = function(http){
      return {run: function(){
        assert.equal(http.data, 'data');
        assert.equal(think.isFunction(http.socketEmit), true)
        assert.equal(think.isFunction(http.socketBroadcast), true)
        assert.equal(http.url, '/open');
        return Promise.resolve();
      }}
    };
    var instance = new WebSocket(server, config, app);
    instance.message('/open', 'data', {request: {
      headers: {},
      res: {setTimeout: function(){}}}
    }).then(function(){
      done();
    }).catch(function(err){console.log(err.stack)})
  })
})