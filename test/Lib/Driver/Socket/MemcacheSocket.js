var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var net = require('net');

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

var MemcacheSocket = thinkRequire('MemcacheSocket');

var Connection = function() {
  var self = this;
  self.readyState = 'close';
  self.events = {};
  setTimeout(function() {
    self.readyState = 'open';
    self.events.connect.call(self);
  }, 10);
};
Connection.prototype = {
  on: function(en, cb) {
    this.events[en] = cb;
  },
  write: function(cmd) {
    if (cmd == 'set var1 0 0 3\r\n111\r\n') {
      this.events.data.call(this, 'STORED\r\n');
    }else if (cmd == 'add var1 0 0 3\r\n111\r\n') {
      this.events.data.call(this, 'ADD\r\n');
    }else if (cmd == 'replace var1 0 0 3\r\n111\r\n') {
      this.events.data.call(this, 'REPLACE\r\n');
    }else if (cmd == 'append var1 0 0 3\r\n111\r\n') {
      this.events.data.call(this, 'APPEND\r\n');
    }else if (cmd == 'prepend var1 0 0 3\r\n111\r\n') {
      this.events.data.call(this, 'PREPEND\r\n');
    } else if (cmd == 'get var1\r\n') {
      this.events.data.call(this, 'VALUE var1 0 3\r\n111\r\nEND\r\n');
    } else if(cmd == 'delete var1\r\n') {
      this.events.data.call(this, 'DELETED\r\n');
    } else if(cmd == 'incr var1 1\r\n') {
      this.events.data.call(this, '112\r\n');
    } else if(cmd == 'decr var1 1\r\n') {
      this.events.data.call(this, '110\r\n');
    } else if(cmd == 'incr var1 2\r\n') {
      this.events.data.call(this, '113\r\n');
    } else if(cmd == 'decr var1 2\r\n') {
      this.events.data.call(this, '109\r\n');
    } else if(cmd == 'version\r\n') {
      this.events.data.call(this, 'VERSION 1.2.1\r\n');
    } else if(cmd == 'get timeout\r\n') {
      this.events.data.call(this, 'TIMEOUT\r\n');
    } else {
      this.events.data.call(this, 'NOT_FOUND\r\n');
    }
  },
  end: function() {
    this.events.end.call(this);
    this.events.close.call(this);
  },
  timeout: function() {
    this.events.timeout.call(this);
  },
  error: function() {
    this.events.error.call(this, 'ERROR');
  },
  setTimeout: function() {},
  setNoDelay: function() {}
};

describe('before', function(){
  it('before', function(){
    muk(net, 'createConnection', function(config) {
      return new Connection(config);
    })
  });
});

describe('MemcacheSocket', function(){
  
  describe('init', function(){
    it('default setting', function(){
      var socket = MemcacheSocket();
      assert.equal(socket.port, 11211);
      assert.equal(socket.host, 'localhost');
    })
    it('set host & port', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      assert.equal(socket.port, 8989);
      assert.equal(socket.host, '127.0.0.1');
    })
  })
  
  describe('connect', function() {
    it('init connect', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.connect();
      assert.ok(socket.handle);
    })
    it('reinit connect', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      var handle1 = socket.connect();
      var handle2 = socket.connect();
      assert.equal(handle1, handle2);
    })
  })
  
  describe('handleGet', function() {
    it('only end tag', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      var res = socket.handleGet('END\r\n');
      assert.deepEqual(res, [null, 5]);
    })
    it('parse get value', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      var res = socket.handleGet('VALUE var 1 1\r\n1\r\nEND\r\n');
      assert.deepEqual(res, ['1', 23]);
      res = socket.handleGet('VALUE var 1 10\r\n1234567890\r\nEND\r\n');
      assert.deepEqual(res, ['1234567890', 33]);
    })
    it('irregular value', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      var res = socket.handleGet('VALUE var 1 10\r\n1234567890\r\n');
      assert.deepEqual(res, ['1234567890', 33]);
      res = socket.handleGet('VALUE var 1 10\r\n1234567890\r\n\r\n');
      assert.deepEqual(res, ['1234567890', 33]);
      res = socket.handleGet('VALUE var 1 10\r\n1234567890');
      assert.deepEqual(res, ['1234567890', 33]);
    })
  })
  
  describe('handleSimple', function() {
    it('simple tag', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      var res = socket.handleSimple('STORED\r\n');
      assert.deepEqual(res, ['STORED', 8, null]);
      res = socket.handleSimple('DELETED\r\n');
      assert.deepEqual(res, ['DELETED', 9, null]);
      res = socket.handleSimple('ERROR\r\n');
      assert.deepEqual(res, ['ERROR', 7, null]);
    })
  })
  
  describe('handleError', function() {
    it('error tag', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      var res = socket.handleError('ERROR\r\n');
      assert.deepEqual(res, [null, 7, 'ERROR']);
      res = socket.handleError('ERROR');
      assert.deepEqual(res, [null, 7, 'ERROR']);
    })
  })
  
  describe('handleVersion', function() {
    it('version tag', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      var res = socket.handleVersion('VERSION 1.2.1\r\n');
      assert.deepEqual(res, ['1.2.1', 15, null]);
    })
  })
  
  describe('memcached CRUD', function() {
    var socket = MemcacheSocket(8989, '127.0.0.1');
    it('set value 1', function(done) {
      socket.store('var1', 111, 'set', '0', '0').then(function(value) {
        assert.equal(value, 'STORED');
        done();
      })
    })
    it('set value 2', function(done) {
      socket.store('var1', 111, 'set').then(function(value) {
        assert.equal(value, 'STORED');
        done();
      })
    })
    it('get value', function(done) {
      socket.get('var1').then(function(value) {
        assert.equal(value, 111);
        done();
      })
    })
    it('not found', function(done) {
      socket.get('var2').catch(function(err) {
        assert.equal(err, 'NOT_FOUND');
        done();
      })
    })
    it('delete value', function(done) {
      socket.delete('var1').then(function(value) {
        assert.equal(value, 'DELETED');
        done();
      })
    })
    it('increase value', function(done) {
      socket.increment('var1').then(function(value) {
        assert.equal(value, 112);
        done();
      })
    })
    it('increase value by step 2', function(done) {
      socket.increment('var1', 2).then(function(value) {
        assert.equal(value, 113);
        done();
      })
    })
    it('decrease value', function(done) {
      socket.decrement('var1').then(function(value) {
        assert.equal(value, 110);
        done();
      })
    })
    it('decrease value by step 2', function(done) {
      socket.decrement('var1', 2).then(function(value) {
        assert.equal(value, 109);
        done();
      })
    })
    it('get version', function(done) {
      socket.version().then(function(value) {
        assert.equal(value, '1.2.1');
        done();
      })
    })
    it('close connection', function() {
      socket.close();
      assert.equal(socket.handle, null);
    })
  })
  
  describe('extension methods', function() {
    var socket = MemcacheSocket(8989, '127.0.0.1');
    it('set', function(done) {
      socket.set('var1', 111, '0', '0').then(function(value) {
        assert.equal(value, 'STORED');
        done();
      })
    })
    it('add', function(done) {
      socket.add('var1', 111, '0', '0').then(function(value) {
        assert.equal(value, 'ADD');
        done();
      })
    })
    it('replace', function(done) {
      socket.replace('var1', 111, '0', '0').then(function(value) {
        assert.equal(value, 'REPLACE');
        done();
      })
    })
    it('append', function(done) {
      socket.append('var1', 111, '0', '0').then(function(value) {
        assert.equal(value, 'APPEND');
        done();
      })
    })
    it('prepend', function(done) {
      socket.prepend('var1', 111, '0', '0').then(function(value) {
        assert.equal(value, 'PREPEND');
        done();
      })
    })
  })
  
  describe('memcached exception', function() {
    it('timeout 1', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      muk(socket, 'handleData', function() {
        socket.handle.timeout();
      });
      socket.get('timeout').catch(function(err) {
        assert.equal(err, 'TIMEOUT');
        done();
      });
    })
    it('timeout 2', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.handle.timeout();
      });
      socket.on('timeout', function(err) {
        done();
      })
      socket.connect();
    })
    it('timeout 3', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.callbacks.push({
          type: 'simple'
        });
        socket.handle.timeout();
      });
      socket.on('timeout', function() {
        done();
      })
      socket.connect();
    })
    it('close connection 1', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.callbacks.push({
          type: 'simple',
          callback: function(err) {
            assert.equal(err, 'CONNECTION_CLOSED');
            done();
          }
        });
        socket.close();
      });
      socket.connect();
    })
    it('close connection 2', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.callbacks.push({
          type: 'simple'
        });
        socket.close();
      });
      socket.on('close', function() {
        assert.equal(socket.handle, null);
        done();
      })
      socket.connect();
    })
    it('close connection 3', function() {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.close();
      assert.equal(socket.handle, null);
    })
    it('server error 1', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.handle.error();
      });
      socket.on('clienterror', function() {
        assert.equal(socket.handle, null);
        done();
      });
      socket.connect();
    })
    it('server error 2', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.callbacks.push({
          type: 'simple',
          callback: function(err) {
            assert.equal(err, 'ERROR');
            done();
          }
        });
        socket.handle.error();
      });
      socket.connect();
    })
    it('server error 3', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.callbacks.push({
          type: 'simple'
        });
        socket.handle.error();
      });
      socket.on('clienterror', function() {
        assert.equal(socket.handle, null);
        done();
      });
      socket.connect();
    })
    it('handle error 1', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.buffer = 'ERROR';
        socket.handleData();
        done();
      });
      socket.connect();
    })
    it('handle error 2', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.buffer = 'ERROR\r\n';
        socket.handleData();
        done();
      });
      socket.connect();
    })
    it('handle error 3', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.buffer = 'ERROR';
        socket.callbacks.push({
          type: 'simple'
        });
        socket.handleData();
        done();
      });
      socket.connect();
    })
    it('handle error 4', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.getHandleResult('UNKNOW');
        done();
      });
      socket.connect();
    })
    it('handle error 5', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      socket.on('connect', function() {
        socket.getHandleResult('STORED\r\n');
        done();
      });
      socket.connect();
    })
    it('handle error 6', function(done) {
      var socket = MemcacheSocket(8989, '127.0.0.1');
      muk(socket, 'getHandleResult', function() {
        return ['', 6];
      });
      socket.on('connect', function() {
        socket.buffer = 'ERROR';
        socket.handleData();
        done();
      });
      socket.connect();
    })
  })
  
});

describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})