var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var mysql = require('mysql');

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

var MysqlSocket = thinkRequire('MysqlSocket');

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
    query: function(sql, cb) {
        if (sql == 'SELECT * FROM `connention_lost`') {
            cb({ code: 'PROTOCOL_CONNECTION_LOST' });
        } else if (sql == 'SELECT * FROM `query_error`') {
            cb({ code: 'QUERY_ERROR' });
        } else if (sql == 'SELECT * FROM `empty`') {
            cb(null);
        } else {
            cb(null, ['DONE']);
        }
    },
    destroy: function() {}
};

describe('before', function(){
  it('before', function(){
    muk(mysql, 'createConnection', function(config) {
      return new Connection(config);
    })
  });
});

describe('MysqlSocket', function(){
  describe('init', function(){
    it('init', function(){
      var config = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: ''
      };
      var socket = MysqlSocket(config);
      assert.equal(socket.config, config);
    })
  })
  describe('connetion', function(){
    it('connetion', function(done){
      var socket = MysqlSocket();
      socket.connect().then(function() {
        assert.deepEqual(socket.handle.config, {
          host: '127.0.0.1',
          port: 3306,
          user: 'root',
          password: ''
        });
        socket.connect().then(function() {
          done();
        });
      });
    })
    it('set config', function(done){
      var socket = MysqlSocket({
        host: '192.168.1.100',
        port: 3306,
        user: 'root',
        password: 'admin'
      });
      socket.connect().then(function() {
        assert.deepEqual(socket.handle.config, {
          host: '192.168.1.100',
          port: 3306,
          user: 'root',
          password: 'admin'
        });
        done();
      });
    })
  })
  describe('query', function(){
    it('simple query', function(done){
      var socket = MysqlSocket();
      socket.query('SELECT * FROM `simple`').then(function(data){
        assert.equal(data[0], 'DONE');
        done();
      });
    })
    it('query empty', function(done){
      var socket = MysqlSocket();
      socket.query('SELECT * FROM `empty`').then(function(data){
        assert.equal(data.length, 0);
        done();
      });
    })
    it('connention lost', function(done){
      var socket = MysqlSocket();
      socket.query('SELECT * FROM `connention_lost`').catch(function(){
        done();
      });
    })
    it('query error', function(done){
      var socket = MysqlSocket();
      socket.query('SELECT * FROM `query_error`').catch(function(){
        done();
      });
    })
    it('connention lost 1', function(done){
      var lost = 0;
      muk(Connection.prototype, 'query', function(sql, cb) {
        if (lost === 0) {
          lost++;
          cb({ code: 'PROTOCOL_CONNECTION_LOST' });
        } else {
          cb(null, ['DONE']);
        }
      });
      var socket = MysqlSocket();
      socket.query('SELECT * FROM `connention_lost_1`').then(function(data){
        assert.equal(data[0], 'DONE');
        done();
      });
    })
    it('show log', function(done){
      C('db_log_sql', true);
      var socket = MysqlSocket();
      socket.query('SELECT * FROM `show_log`').then(function(){
        done();
      });
    })
  })
  describe('close connetion', function(){
    it('close connetion 1', function(done){
      var socket = MysqlSocket();
      socket.connect().then(function() {
        socket.close();
        socket.close();
        assert.equal(socket.handle, null);
        done();
      });
    })
    it('close connetion 2', function(done){
      var socket = MysqlSocket();
      socket.connect().then(function() {
        socket.handle.end();
        assert.equal(socket.handle, null);
        done();
      });
    })
  })
  describe('connetion error', function(){
    it('connetion error 1', function(done){
      var socket = MysqlSocket();
      socket.connect().then(function() {
        socket.handle.error();
        assert.equal(socket.handle, null);
        done();
      });
    })
    it('connetion error 2', function(done){
      muk(Connection.prototype, 'connect', function(cb) {
        setTimeout(function() {
          cb(new Error('connection error'));
        }, 10);
      });
      var socket = MysqlSocket();
      socket.connect().then(function() {
      }).catch(function(err) {
        assert.ok(err);
        done();
      });
    })
    it('connetion error 3', function(done){
      muk(Connection.prototype, 'connect', function(cb) {
        setTimeout(cb, 1000);
      });
      var socket = MysqlSocket();
      var deferred = getDefer();
      socket.deferred = deferred;
      deferred.promise.catch(function(err) {
        assert.ok(err);
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
});