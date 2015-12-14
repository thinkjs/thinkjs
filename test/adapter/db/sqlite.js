'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var Sqlite = require('../../../lib/adapter/db/sqlite.js');


describe('adapter/db/sqlite', function(){
  it('get instance', function(){
    var instance = new Sqlite();
    assert.equal(instance._socket, null)
  })
  it('get socket', function(){
    var instance = new Sqlite();
    var socket = instance.socket();
    assert.equal(instance._socket == socket, true);
  })
  it('get socket, again', function(){
    var instance = new Sqlite();
    var socket = instance.socket();
    var socket1 = instance.socket();
    assert.equal(socket1 == socket, true);
  })
  it('escape string', function(){
    var instance = new Sqlite();
    var str = instance.escapeString("welefen'suredy");
    assert.equal(str, "welefen\'\'suredy");
  })
  it('escape string, multi', function(){
    var instance = new Sqlite();
    var str = instance.escapeString("welefen'sur'edy");
    assert.equal(str, "welefen\'\'sur\'\'edy");
  })
  it('parseLimit, empty', function(){
    var instance = new Sqlite();
    var str = instance.parseLimit();
    assert.equal(str, '')
  })
  it('parseLimit, number', function(){
    var instance = new Sqlite();
    var str = instance.parseLimit(12);
    assert.equal(str, ' LIMIT 12')
  })
  it('parseLimit, string', function(){
    var instance = new Sqlite();
    var str = instance.parseLimit('12');
    assert.equal(str, ' LIMIT 12')
  })
  it('parseLimit, string 1', function(){
    var instance = new Sqlite();
    var str = instance.parseLimit('12, 10');
    assert.equal(str, ' LIMIT 10 OFFSET 12')
  })
  it('parseLimit, array', function(){
    var instance = new Sqlite();
    var str = instance.parseLimit([12, 10]);
    assert.equal(str, ' LIMIT 10 OFFSET 12')
  })
  it('get fields', function(done){
    var instance = new Sqlite();
    instance.query = function(sql){
      if(sql === 'PRAGMA table_info( user )'){
        return Promise.resolve([{"cid":0,"name":"id","type":"INTEGER","notnull":1,"dflt_value":null,"pk":1},{"cid":1,"name":"name","type":"TEXT","notnull":1,"dflt_value":null,"pk":0},{"cid":2,"name":"pwd","type":"TEXT","notnull":1,"dflt_value":null,"pk":0},{"cid":3,"name":"create_time","type":"INTEGER","notnull":1,"dflt_value":null,"pk":0}]);
      }
      return Promise.resolve([]);
    }
    instance.getFields('user').then(function(data){
      assert.deepEqual(data, {"id":{"name":"id","type":"INTEGER","required":true,"default":null,"primary":true,"auto_increment":false,"unique":false},"name":{"name":"name","type":"TEXT","required":true,"default":null,"primary":false,"auto_increment":false,"unique":false},"pwd":{"name":"pwd","type":"TEXT","required":true,"default":null,"primary":false,"auto_increment":false,"unique":false},"create_time":{"name":"create_time","type":"INTEGER","required":true,"default":null,"primary":false,"auto_increment":false,"unique":false}})
      done();
    })
  })
  it('getFields 1', function(done){
    var instance = new Sqlite();
    instance.query = function(sql){
      if(sql === 'PRAGMA table_info( user )'){
        return Promise.resolve([{"cid":0,"name":"id","type":"INTEGER","notnull":1,"dflt_value":null,"pk":1},{"cid":1,"name":"name","type":"TEXT","notnull":1,"dflt_value":null,"pk":0},{"cid":2,"name":"pwd","type":"TEXT","notnull":1,"dflt_value":null,"pk":0},{"cid":3,"name":"create_time","type":"INTEGER","notnull":1,"dflt_value":null,"pk":0}]);
      }else if(sql === 'PRAGMA INDEX_LIST( user )'){
        return Promise.resolve([{
          name: 'xxxx',
          unique: true
        }, {
          name: 'test'
        }]);
      }else if(sql === 'PRAGMA index_info( xxxx )'){
        return Promise.resolve([{
          name: 'name'
        }])
      }
      return Promise.resolve([]);
    }
    instance.getFields('user').then(function(data){
      assert.deepEqual(data, {"id":{"name":"id","type":"INTEGER","required":true,"default":null,"primary":true,"auto_increment":false,"unique":false},"name":{"name":"name","type":"TEXT","required":true,"default":null,"primary":false,"auto_increment":false,"unique":true},"pwd":{"name":"pwd","type":"TEXT","required":true,"default":null,"primary":false,"auto_increment":false,"unique":false},"create_time":{"name":"create_time","type":"INTEGER","required":true,"default":null,"primary":false,"auto_increment":false,"unique":false}});
      done();
    })
  })
})