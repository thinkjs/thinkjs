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

var sqliteSocket = think.adapter('socket', 'sqlite');

describe('adapter/socket/sqlite', function(){
  it('get instance, path is true', function(){
    var instance = new sqliteSocket({
      name: 'test',
      path: true
    });
    assert.deepEqual(instance.config, { name: 'test', path: ':memory:' });
  })
  it('get instance, path is not set', function(){
    var mkdir = think.mkdir;
    think.mkdir = function(){

    }
    var instance = new sqliteSocket({
      name: 'test'
    })
    assert.deepEqual(instance.config, {name: 'test', path: think.APP_PATH + '/common/runtime/sqlite/test.sqlite'});
    think.mkdir = mkdir;
  })
    it('get instance, config is empty', function(){
    var mkdir = think.mkdir;
    think.mkdir = function(){

    }
    var instance = new sqliteSocket()
    assert.deepEqual(instance.config, {path: think.APP_PATH + '/common/runtime/sqlite/undefined.sqlite'});
    think.mkdir = mkdir;
  })
  it('get instance, path is set', function(){
    var mkdir = think.mkdir;
    think.mkdir = function(){}
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/test'
    })
    assert.deepEqual(instance.config, {name: 'test', path: think.APP_PATH + '/test/test.sqlite'});
    think.mkdir = mkdir;
  })
  it('get connection', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf'
    })
    var npm = think.npm;
    think.npm = function(){
      return {
        Database: function(path, callback){
          assert.equal(path, think.APP_PATH + '/fsafasf/test.sqlite');
          callback && callback();
        }
      }
    }
    instance.getConnection().then(function(){
      think.npm = npm;
      done();
    })
  })
  it('get connection, verbose', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      verbose: true,
      path: think.APP_PATH + '/fsafasf'
    })
    var npm = think.npm;
    think.npm = function(){
      return {
        verbose: function(){
          return {
            Database: function(path, callback){
              assert.equal(path, think.APP_PATH + '/fsafasf/test.sqlite');
              callback && callback();
            }
          }
        }
      }
    }
    instance.getConnection().then(function(){
      think.npm = npm;
      done();
    })
  })
  it('get connection, busyTimeout', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      verbose: true,
      path: think.APP_PATH + '/fsafasf',
      timeout: 100
    })
    var npm = think.npm;
    think.npm = function(){
      return {
        verbose: function(){
          return {
            Database: function(path, callback){
              assert.equal(path, think.APP_PATH + '/fsafasf/test.sqlite');
              callback && callback();
              return {
                configure: function(name, timeout){
                  assert.equal(name, 'busyTimeout');
                  assert.equal(timeout, 100000);
                }
              }
            }
          }
        }
      }
    }
    instance.getConnection().then(function(){
      think.npm = npm;
      done();
    })
  })
  it('get connection, error', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf'
    })
    var npm = think.npm;
    var error = think.error;
    var wait = think.await;
    think.npm = function(){
      return {
        Database: function(path, callback){
          assert.equal(path, think.APP_PATH + '/fsafasf/test.sqlite');
          callback && callback(new Error('sqlite get connection error'));
        }
      }
    }
    think.error = function(promise, err){
      assert.equal(err.message, 'sqlite://' + think.APP_PATH + '/fsafasf/test.sqlite')
      return promise;
    }
    think.await = function(str, callback){
      return callback && callback();
    }
    instance.getConnection().catch(function(err){
      assert.equal(err.message, 'sqlite get connection error');
      think.npm = npm;
      think.error = error;
      think.await = wait;
      done();
    })
  })
  it('get connection, exist', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf'
    })
    instance.connection = {};
    instance.getConnection().then(function(connection){
      assert.deepEqual(connection, {});
      done();
    })
  })
  it('execute', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf'
    })
    instance.getConnection = function(){
      return {
        run: function(sql, callback){
          assert.equal(sql, 'DELETE FROM think_user where id=1');
          callback && callback.call({
            lastID: 100,
            changes: 10
          })
        }
      }
    }
    instance.execute('DELETE FROM think_user where id=1').then(function(data){
      assert.deepEqual(data, { insertId: 100, affectedRows: 10 });
      done();
    })
  })
  it('execute, log sql', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf',
      log_sql: true
    })
    var log = think.log;
    think.log = function(sql, type, startTime){
      assert.equal(sql, 'DELETE FROM think_user where id=1');
      assert.equal(type, 'SQL');
      assert.equal(think.isNumber(startTime), true);
    }
    instance.getConnection = function(){
      return {
        run: function(sql, callback){
          assert.equal(sql, 'DELETE FROM think_user where id=1');
          callback && callback.call({
            lastID: 100,
            changes: 10
          })
        }
      }
    }
    instance.execute('DELETE FROM think_user where id=1').then(function(data){
      assert.deepEqual(data, { insertId: 100, affectedRows: 10 });
      think.log = log;
      done();
    })
  })
  it('execute, error', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf'
    })
    var error = think.error;
    instance.getConnection = function(){
      return {
        run: function(sql, callback){
          assert.equal(sql, 'DELETE FROM think_user where id=1');
          callback && callback(new Error('sqlite execute error'));
        }
      }
    }
    think.error = function(promise){
      return promise;
    }
    instance.execute('DELETE FROM think_user where id=1').catch(function(err){
      assert.deepEqual(err.message, 'sqlite execute error');
      think.error = error;
      done();
    })
  })
  it('query', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf'
    })
    instance.getConnection = function(){
      return {
        all: function(sql, callback){
          assert.equal(sql, 'SELECT * FROM think_user');
          callback && callback(null, []);
        }
      }
    }
    instance.query('SELECT * FROM think_user').then(function(data){
      assert.deepEqual(data, []);
      done();
    })
  })
  it('query, log sql', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf',
      log_sql: true
    })
    var log = think.log;
    think.log = function(sql, type, startTime){
      assert.equal(sql, 'SELECT * FROM think_user');
      assert.equal(type, 'SQL');
      assert.equal(think.isNumber(startTime), true);
    }
    instance.getConnection = function(){
      return {
        all: function(sql, callback){
          assert.equal(sql, 'SELECT * FROM think_user');
          callback && callback(null, []);
        }
      }
    }
    instance.query('SELECT * FROM think_user').then(function(data){
      assert.deepEqual(data, []);
      think.log = log;
      done();
    })
  })
   it('query error, log sql', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf',
      log_sql: true
    })
    var flag = false;
    muk(think, 'log', function(sql, type, startTime){
      assert.equal(sql, 'SELECT * FROM think_user');
      assert.equal(type, 'SQL');
      assert.equal(think.isNumber(startTime), true);
      flag = true;
    })
    muk(think, 'error', function(promise){
      return promise;
    })
    instance.getConnection = function(){
      return {
        all: function(sql, callback){
          assert.equal(sql, 'SELECT * FROM think_user');
          callback && callback(new Error('xxxwww'), []);
        }
      }
    }
    instance.query('SELECT * FROM think_user').catch(function(err){
      muk.restore();
      assert.equal(flag, true)
      done();
    })
  })
  it('query, error', function(done){
    var instance = new sqliteSocket({
      name: 'test',
      path: think.APP_PATH + '/fsafasf'
    })
    var error = think.error;
    instance.getConnection = function(){
      return {
        all: function(sql, callback){
          assert.equal(sql, 'SELECT * FROM think_user');
          callback && callback(new Error('sqlite query error'));
        }
      }
    }
    think.error = function(promise){
      return promise;
    }
    instance.query('SELECT * FROM think_user').catch(function(err){
      assert.deepEqual(err.message, 'sqlite query error');
      think.error = error;
      done();
    })
  })

})