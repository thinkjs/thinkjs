'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var Base = require('../../../lib/adapter/db/base.js');

describe('adapter/db/base.js', function(){
  it('get instance', function(){
    var instance = new Base();
    assert.equal(instance.sql, '');
    assert.equal(instance.lastInsertId, 0);
    assert.equal(instance._socket, null);
    assert.equal(instance.transTimes, 0);
  })
  it('socket is function', function(){
    var instance = new Base();
    var socket = instance.socket();
    assert.equal(think.isFunction(instance.socket), true);
    assert.equal(socket, undefined);
  })
  it('add data', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.add({
      name: 'welefen',
      title: 'suredy',
      key: 1111
    }, {
      table: 'think_user',
    }).then(function(data){
      assert.equal(data, "INSERT INTO think_user (name,title,key) VALUES ('welefen','suredy',1111)")
      done();
    })
  })
  it('replace data', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.add({
      name: 'welefen',
      title: 'suredy',
      key: 1111
    }, {
      table: 'think_user',
    }, true).then(function(data){
      assert.equal(data, "REPLACE INTO think_user (name,title,key) VALUES ('welefen','suredy',1111)")
      done();
    })
  })
  it('replace data, ignore some data', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.add({
      name: 'welefen',
      title: 'suredy',
      key: 1111,
      test: ['suredy']
    }, {
      table: 'think_user',
    }, true).then(function(data){
      assert.equal(data, "REPLACE INTO think_user (name,title,key) VALUES ('welefen','suredy',1111)")
      done();
    })
  })
  it('add many', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.addMany([{
      name: 'welefen',
      title: 'suredy',
      key: 1111
    },{
      name: 'welefen2',
      title: 'suredy2',
      key: 222
    }], {
      table: 'think_user',
    }).then(function(data){
      assert.equal(data, "INSERT INTO think_user(name,title,key) VALUES ('welefen','suredy',1111),('welefen2','suredy2',222)")
      done();
    })
  })
  it('add many, replace', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.addMany([{
      name: 'welefen',
      title: 'suredy',
      key: 1111
    },{
      name: 'welefen2',
      title: 'suredy2',
      key: 222
    }], {
      table: 'think_user',
    }, true).then(function(data){
      assert.equal(data, "REPLACE INTO think_user(name,title,key) VALUES ('welefen','suredy',1111),('welefen2','suredy2',222)")
      done();
    })
  })
  it('add many, ignore some data', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.addMany([{
      name: 'welefen',
      title: 'suredy',
      key: 1111
    },{
      name: 'welefen2',
      title: 'suredy2',
      key: 222,
      test: ['suredy']
    }], {
      table: 'think_user',
    }, true).then(function(data){
      assert.equal(data, "REPLACE INTO think_user(name,title,key) VALUES ('welefen','suredy',1111),('welefen2','suredy2',222)")
      done();
    })
  })
  it('select add', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.selectAdd('name,title', 'suredy', {
      table: 'think_other',
      where: {name: 'welefen'},
      limit: 30
    }).then(function(data){
      assert.equal(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'welefen' ) LIMIT 30")
      done();
    })
  })
  it('select add, fields is array', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.selectAdd(['name', 'title'], 'suredy', {
      table: 'think_other',
      where: {name: 'welefen'},
      limit: 30
    }).then(function(data){
      assert.equal(data, "INSERT INTO suredy (name,title) SELECT * FROM think_other WHERE ( name = 'welefen' ) LIMIT 30")
      done();
    })
  })
  it('select add, options is empty', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.selectAdd(['name', 'title'], 'suredy').then(function(data){
      assert.equal(data, "INSERT INTO suredy (name,title) SELECT * FROM ")
      done();
    })
  })
  it('delete', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.delete({
      table: 'think_user',
      where: {name: 'welefen'},
      comment: 'welefen'
    }).then(function(data){
      assert.equal(data, "DELETE FROM think_user WHERE ( name = 'welefen' ) /*welefen*/")
      done();
    })
  })
  it('update', function(done){
    var instance = new Base();
    instance.execute = function(sql){
      return Promise.resolve(sql);
    }
    instance.update({
      name: 'welefen',
      title: 'title'
    },{
      table: 'think_user',
      where: {name: 'welefen'},
      comment: 'welefen'
    }).then(function(data){
      assert.equal(data, "UPDATE think_user SET name='welefen',title='title' WHERE ( name = 'welefen' ) /*welefen*/")
      done();
    })
  })
  it('select', function(done){
    var instance = new Base();
    instance.query = function(sql){
      return Promise.resolve(sql);
    }
    instance.select({
      table: 'think_user',
      where: {name: 'welefen'},
      comment: 'welefen'
    }).then(function(data){
      assert.equal(data, "SELECT * FROM think_user WHERE ( name = 'welefen' ) /*welefen*/")
      done();
    })
  })
  it('select, cache', function(done){
    var instance = new Base({
      cache: {
        on: true
      }
    });
    instance.query = function(sql){
      return Promise.resolve(sql);
    }
    muk(think, 'cache', function(key, callback){
      assert.equal(key, '2b61c1d39430dede45ee9f514bdaa2a9')
      return callback && callback();
    })
    instance.select({
      table: 'think_user',
      where: {name: 'welefen'},
      comment: 'welefen',
      cache: {
        timeout: 3600
      }
    }).then(function(data){
      assert.equal(data, "SELECT * FROM think_user WHERE ( name = 'welefen' ) /*welefen*/");
      muk.restore();
      done();
    })
  })
  it('select, cache, with key', function(done){
    var instance = new Base({
      cache: {
        on: true
      }
    });
    instance.query = function(sql){
      return Promise.resolve(sql);
    }
    muk(think, 'cache', function(key, callback){
      assert.equal(key, 'test')
      return callback && callback();
    })
    instance.select({
      table: 'think_user',
      where: {name: 'welefen'},
      comment: 'welefen',
      cache: {
        timeout: 3600,
        key: 'test'
      }
    }).then(function(data){
      assert.equal(data, "SELECT * FROM think_user WHERE ( name = 'welefen' ) /*welefen*/");
      muk.restore();
      done();
    })
  })
  it('select, string', function(done){
    var instance = new Base();
    instance.query = function(sql){
      return Promise.resolve(sql);
    }
    instance.select("SELECT * FROM think_user WHERE ( name = 'welefen' ) /*welefen*/").then(function(data){
      assert.equal(data, "SELECT * FROM think_user WHERE ( name = 'welefen' ) /*welefen*/")
      done();
    })
  })
  it('escapeString, empty', function(){
    var instance = new Base();
    var data = instance.escapeString();
    assert.equal(data, '')
  })
  it('escapeString, \\n', function(){
    var instance = new Base();
    var data = instance.escapeString('\n');
    assert.equal(data, '\\n')
  })
  it('escapeString, \\0', function(){
    var instance = new Base();
    var data = instance.escapeString('\0');
    assert.equal(data, '\\0')
  })
  it('escapeString, \\r', function(){
    var instance = new Base();
    var data = instance.escapeString('\r');
    assert.equal(data, '\\r')
  })
  it('escapeString, \\b', function(){
    var instance = new Base();
    var data = instance.escapeString('\b');
    assert.equal(data, '\\b')
  })
  it('escapeString, \\t', function(){
    var instance = new Base();
    var data = instance.escapeString('\t');
    assert.equal(data, '\\t')
  })
  it('escapeString, \\Z', function(){
    var instance = new Base();
    var data = instance.escapeString('\u001a');
    assert.equal(data, '\\Z')
  })
  it('escapeString, \\"', function(){
    var instance = new Base();
    var data = instance.escapeString('"');
    assert.equal(data, '\\"')
  })
  it('query', function(done){
    var instance = new Base();
    instance.socket = function(){
      return {
        query: function(sql){
          return Promise.resolve(sql);
        }
      }
    }
    instance.query('SELECT * FROM think_user').then(function(data){
      assert.equal(data, 'SELECT * FROM think_user');
      assert.equal(instance.getLastSql(), 'SELECT * FROM think_user')
      done();
    })
  })
  it('execute', function(done){
    var instance = new Base();
    instance.socket = function(){
      return {
        execute: function(sql){
          return Promise.resolve({
            insertId: 1000,
            affectedRows: 10
          });
        }
      }
    }
    instance.execute('DELETE FROM think_user').then(function(data){
      assert.equal(data, 10);
      assert.equal(instance.getLastInsertId(), 1000)
      done();
    })
  })
  it('execute, empty return', function(done){
    var instance = new Base();
    instance.socket = function(){
      return {
        execute: function(sql){
          return Promise.resolve({
          });
        }
      }
    }
    instance.execute('DELETE FROM think_user').then(function(data){
      assert.equal(data, 0);
      assert.equal(instance.getLastInsertId(), 0)
      done();
    })
  })
  it('bufferToString', function(){
    var instance = new Base({buffer_tostring: true});
    var data = instance.bufferToString([{name: new Buffer('welefen'), title: 'sss'}]);
    assert.deepEqual(data, [{name: 'welefen', title: 'sss'}])
  })
  it('close', function(){
    var instance = new Base({buffer_tostring: true});
    var flag = false;
    instance._socket = {
      close: function(){
        flag = true;
      }
    }
    instance.close();
    assert.equal(flag, true);
  })
  it('close', function(){
    var instance = new Base({buffer_tostring: true});
    var flag = false;
    instance.close();
    assert.equal(flag, false);
  })
  it('startTrans', function(done){
    var instance = new Base();
    var flag = false;
    instance.execute = function(sql){
      assert.equal(sql, 'START TRANSACTION');
      flag = true;
      return Promise.resolve();
    }
    instance.startTrans().then(function(data){
      assert.equal(flag, true);
      instance.transTimes = 1;
      done();
    })
  })
  it('startTrans, is started', function(done){
    var instance = new Base();
    instance.transTimes = 1;
    var flag = false;
    instance.execute = function(sql){
      assert.equal(sql, 'START TRANSACTION');
      flag = true;
      return Promise.resolve();
    }
    instance.startTrans().then(function(data){
      assert.equal(flag, false);
      instance.transTimes = 1;
      done();
    })
  })
  it('commit, not start', function(done){
    var instance = new Base();
    var flag = false;
    instance.execute = function(sql){
      assert.equal(sql, 'ROLLBACK');
      flag = true;
      return Promise.resolve();
    }
    instance.commit().then(function(data){
      assert.equal(flag, false);
      instance.transTimes = 0;
      done();
    })
  })
  it('commit', function(done){
    var instance = new Base();
    instance.transTimes = 1;
    var flag = false;
    instance.execute = function(sql){
      assert.equal(sql, 'COMMIT');
      flag = true;
      return Promise.resolve();
    }
    instance.commit().then(function(data){
      assert.equal(flag, true);
      instance.transTimes = 0;
      done();
    })
  })
  it('rollback, not start', function(done){
    var instance = new Base();
    var flag = false;
    instance.execute = function(sql){
      assert.equal(sql, 'ROLLBACK');
      flag = true;
      return Promise.resolve();
    }
    instance.rollback().then(function(data){
      assert.equal(flag, false);
      instance.transTimes = 0;
      done();
    })
  })
  it('rollback', function(done){
    var instance = new Base();
    instance.transTimes = 1;
    var flag = false;
    instance.execute = function(sql){
      assert.equal(sql, 'ROLLBACK');
      flag = true;
      return Promise.resolve();
    }
    instance.rollback().then(function(data){
      assert.equal(flag, true);
      instance.transTimes = 0;
      done();
    })
  })
})