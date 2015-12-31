var assert = require('assert');
var muk = require('muk');
var path = require('path');


for(var filepath in require.cache){
  delete require.cache[filepath];
}

var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var MysqlSocket = think.adapter('socket', 'mysql');


var Connection = function(config) {
  this.config = config;
  this.events = {};
};
Connection.prototype = {
  connect: function(cb) {
    setTimeout(cb, 10);
  },
  on: function(en, cb) {
    this.events[en] = cb;
  },
  error: function() {
    this.events.error();
  },
  end: function() {
    this.events.end();
  },
  query: function(data, cb) {
    if (data.timeout) {
      cb({ code: 'PROTOCOL_SEQUENCE_TIMEOUT' });
      return;
    }
    var sql = data.sql;
    if (sql === 'SELECT * FROM `connention_lost`') {
      cb({ code: 'PROTOCOL_CONNECTION_LOST' });
    } else if (sql === 'SELECT * FROM `query_error`') {
      cb({ code: 'QUERY_ERROR' });
    } else if (sql === 'SELECT * FROM `empty`') {
      cb(null, []);
    } else {
      cb(null, ['DONE']);
    }
  },
  destroy: function() {},
  release: function(){}
};


describe('adapter/socket/mysql', function(){

  var npm, error;

  before(function() {
    npm = think.npm;
    think.npm = function() {
      return {
        createConnection: function(config) {
          return new Connection(config);
        },
        createPool: function(config) {
          return {
            getConnection: function(cb) {
              if (config.connectionLimit > 99) {
                cb({ code: 'ERROR' });
              } else {
                cb(null, new Connection(config));
              }
            },
            end: function() {}
          };
        }
      };
    };
    error = think.error;
    think.error = function(promise) {
      return promise;
    };
  });

  describe('init', function(){
    it('create instance', function(){
      var config = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: ''
      };
      var socket = new MysqlSocket(config);
      assert.deepEqual(socket.config, config);
    });

    it('alias', function(){
      var config = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123',
        database: 'thinkjs'
      };
      var socket = new MysqlSocket(config);
      assert.deepEqual(socket.config, {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123',
        database: 'thinkjs'
      });
    });
  });

  describe('connetion', function(){
    it('get connetion 1', function(done){
      var socket = new MysqlSocket();
      socket.getConnection().then(function(connection) {
        assert.deepEqual(connection.config, {
          host: '127.0.0.1',
          port: 3306,
          user: 'root',
          password: ''
        });
        done();
      });
    });

    it('get connetion 2', function(done){
      var socket = new MysqlSocket();
      socket.getConnection().then(function(connection1) {
        socket.getConnection().then(function(connection2) {
          assert.equal(connection1, connection2);
          done();
        });
      });
    });

    it('get connetion from pool', function(done){
      var socket = new MysqlSocket({
        connectionLimit: 10
      });
      socket.getConnection().then(function() {
        assert.ok(socket.pool);
        done();
      });
    });

    it('get connetion from pool, error', function(done){
      var reject = think.reject;
      think.reject = function(err){
        return Promise.reject(err);
      }
      var socket = new MysqlSocket({
        connectionLimit: 100
      });
      socket.getConnection().catch(function() {
        think.reject = reject;
        done();
      });
    });
  });

  describe('query', function(){
    it('simple query', function(done){
      var socket = new MysqlSocket();
      socket.query('SELECT * FROM `simple`').then(function(data){
        assert.equal(data[0], 'DONE');
        done();
      });
    });
    it('query empty', function(done){
      var socket = new MysqlSocket();
      socket.query('SELECT * FROM `empty`').then(function(data){
        assert.deepEqual(data, []);
        done();
      });
    });
    it('query, timeout', function(done){
      var socket = new MysqlSocket({ timeout: 10 });
      socket.query('SELECT * FROM `query_error`').catch(function(err){
        assert.equal(err.code, 'PROTOCOL_SEQUENCE_TIMEOUT');
        done();
      });
    });
    it('query connention_lost', function(done){
      var socket = new MysqlSocket();
      var flag = false;
      socket.close = function(){
        flag = true;
      }
      socket.query('SELECT * FROM `connention_lost`').catch(function(){
        assert.equal(flag, true);
        done();
      });
    });
    it('query error', function(done){
      var socket = new MysqlSocket();
      socket.query('SELECT * FROM `query_error`').catch(function(){
        done();
      });
    });
    it('query, pool release', function(done){
      var instance = new MysqlSocket();
      instance.pool = {};
      var flag = false;
      instance.getConnection = function(){
        return {
          query: function(query, fn){
            fn && fn(null, 'data')
          },
          release: function(){
            flag = true;
          }
        }
      }
      instance.query('SELECT * FROM `empty`').then(function(){
        assert.equal(flag, true)
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    });
    it('query error, pool release', function(done){
      var instance = new MysqlSocket();
      instance.pool = {};
      var flag = false;
      instance.getConnection = function(){
        return {
          query: function(query, fn){
            fn && fn(new Error('xxx'), 'data')
          },
          release: function(){
            flag = true;
          }
        }
      }
      instance.query('SELECT * FROM `empty`').catch(function(){
        assert.equal(flag, true)
        done();
      })
    });
    it('query, pool release, empty data', function(done){
      var instance = new MysqlSocket();
      instance.pool = {};
      var flag = false;
      instance.getConnection = function(){
        return {
          query: function(query, fn){
            fn && fn(null)
          },
          release: function(){
            flag = true;
          }
        }
      }
      instance.query('SELECT * FROM `empty`').then(function(){
        assert.equal(flag, true)
        done();
      })
    });
    it('query error, pool release, log error', function(done){
      var instance = new MysqlSocket({});
      instance.pool = {};
      var flag = false;
      instance.getConnection = function(){
        return {
          query: function(query, fn){
            fn && fn(new Error('xxx'), 'data')
          },
          release: function(){
            flag = true;
          }
        }
      }
      muk(think, 'log', function(str, type){
        assert.equal(type, 'SQL')
      })
      instance.config.log_sql = true;
      instance.query('SELECT * FROM `empty`').catch(function(){
        assert.equal(flag, true);
        muk.restore();
        done();
      })
    });
    it('query, log sql', function(done){
      var log = think.log;
      think.log = function(sql, type, startTime){
        assert.equal(sql, 'SELECT * FROM `empty`');
        assert.equal(type, 'SQL');
        assert.equal(think.isNumber(startTime), true);
      };
      var socket = new MysqlSocket({ log_sql: true });
      socket.query('SELECT * FROM `empty`').then(function(data){
        assert.deepEqual(data, []);
        think.log = log;
        done();
      });
    });
  });

  describe('execute', function(){
    it('execute', function(){
      var instance = new MysqlSocket();
      instance.query = function(){
        assert.deepEqual([].slice.call(arguments), [1,2,3]);
      }
      instance.execute(1,2,3)
    })
  })

  describe('close connetion', function(){
    it('close connetion 1', function(done){
      var socket = new MysqlSocket();
      socket.getConnection().then(function() {
        socket.close();
        assert.equal(socket.connection, null);
        done();
      });
    });
    it('close connetion 2', function(done){
      var socket = new MysqlSocket();
      socket.getConnection().then(function() {
        socket.connection.end();
        assert.equal(socket.connection, null);
        done();
      });
    });
  });

  describe('connetion error', function(){
    it('connetion error 1', function(done){
      var socket = new MysqlSocket();
      var reject = think.reject;
      think.reject = function(err){
        return Promise.reject(err);
      }
      socket.getConnection().then(function() {
        socket.connection.error();
        assert.equal(socket.connection, null);
        think.reject = reject;
        done();
      });
    });
    it('connetion error 2', function(done){
      var fn = Connection.prototype.connect;
      var reject = think.reject;
      think.reject = function(err){
        return Promise.reject(err);
      }
      Connection.prototype.connect = function(cb) {
        setTimeout(function() {
          cb(new Error('connection error'));
        }, 10);
      };
      var socket = new MysqlSocket();
      socket.getConnection().catch(function(err) {
        assert.equal(think.isError(err), true);
        Connection.prototype.connect = fn;
        think.reject = reject;
        done();
      });
    });
  });

  describe('close', function(){
    it('pool close', function(){
      var instance = new MysqlSocket();
      instance.pool = {
        end: function(fn){
          fn && fn();
        }
      }
      instance.close();
      assert.equal(instance.pool, null)
    })
    it('connection close', function(){
      var instance = new MysqlSocket();
      instance.connection = {
        end: function(fn){
          fn && fn();
        }
      }
      instance.close();
      assert.equal(instance.connection, null)
    })
    it('empty close', function(){
      var instance = new MysqlSocket();
      instance.connection = null;
      instance.close();
      assert.equal(instance.connection, null)
    })
  })


  after(function(){
    think.npm = npm;
    think.error = error;
  });

});
