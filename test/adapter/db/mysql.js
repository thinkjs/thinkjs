'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var Mysql = require('../../../lib/adapter/db/mysql.js');


describe('adapter/db/mysql.js', function(){
  it('get instance', function(){
    var instance = new Mysql();
    assert.equal(instance.transTimes, 0);
  })
  it('socket', function(){
    var instance = new Mysql();
    var socket = instance.socket();
    assert.equal(think.isObject(socket), true);
  })
  it('socket, exist', function(){
    var instance = new Mysql();
    var socket = instance.socket();
    var socket2 = instance.socket();
    assert.equal(socket, socket2);
  })
  it('get fields', function(done){
    var instance = new Mysql();
    instance.query = function(sql){
      assert.equal(sql, "SHOW COLUMNS FROM `user`");
      var data = [ { Field: 'id',    Type: 'int(11) unsigned',    Null: 'NO',    Key: 'PRI',    Default: null,    Extra: 'auto_increment' },  { Field: 'name',    Type: 'varchar(255)',    Null: 'NO',    Key: '',    Default: '',    Extra: '' },  { Field: 'title',    Type: 'varchar(255)',    Null: 'NO',    Key: '',    Default: '',    Extra: '' }   ];
      return Promise.resolve(data);
    }
    instance.getFields('user').then(function(data){
      assert.deepEqual(data, { id:  { name: 'id',    type: 'int(11) unsigned',    required: false,    default: null,    primary: true,    unique: false,    auto_increment: true }, name:  { name: 'name',    type: 'varchar(255)',    required: false,    default: '',    primary: false,    unique: false,    auto_increment: false }, title:  { name: 'title',    type: 'varchar(255)',    required: false,    default: '',    primary: false,    unique: false,    auto_increment: false } })
      done();
    })
  })
  it('startTrans', function(done){
    var instance = new Mysql();
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
    var instance = new Mysql();
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
    var instance = new Mysql();
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
    var instance = new Mysql();
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
    var instance = new Mysql();
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
    var instance = new Mysql();
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
  it('parseKey, empty', function(){
    var instance = new Mysql();
    var data = instance.parseKey();
    assert.equal(data, '')
  })
  it('parseKey', function(){
    var instance = new Mysql();
    var data = instance.parseKey('test');
    assert.equal(data, '`test`')
  })
  it('parseKey, has special chars', function(){
    var instance = new Mysql();
    var data = instance.parseKey('te"st');
    assert.equal(data, 'te"st')
  })
})