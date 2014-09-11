var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var net = require('net');
var fs = require('fs')

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

var MysqlDb = thinkRequire('MysqlDb');
var MysqlSocket = thinkRequire('MysqlSocket');


describe('before', function(){
  it('before', function(){
    muk(MysqlSocket.prototype, 'query', function(sql){
      sql = sql.trim();
      if (sql === 'SHOW COLUMNS FROM `meinv_session`') {
        return getPromise([ 
          { Field: 'id',Type: 'int(11) unsigned',Null: 'NO',Key: 'PRI',Default: null,Extra: 'auto_increment' },
          { Field: 'key',Type: 'varchar(255)',Null: 'NO',Key: 'UNI',Default: '',Extra: '' },
          { Field: 'data',Type: 'text',Null: 'YES',Key: '',Default: null,Extra: '' },
          { Field: 'expire',Type: 'bigint(11)',Null: 'NO',Key: 'MUL',Default: null,Extra: '' } 
        ]);
      }else if(sql === "UPDAET think_user set name='333'"){
        return getPromise({affectedRows: 10})
      }else if (sql === "INSERT think_user name VALUES('welefen')") {
        return getPromise({insertId: 999})
      }else if (sql === 'SHOW TABLES') {
        return getPromise([ { 'Tables_in_www.welefen.com': 'thinkpress_cate' },{ 'Tables_in_www.welefen.com': 'thinkpress_post' },{ 'Tables_in_www.welefen.com': 'thinkpress_post_cate' },{ 'Tables_in_www.welefen.com': 'thinkpress_post_tag' },{ 'Tables_in_www.welefen.com': 'thinkpress_tag' },{ 'Tables_in_www.welefen.com': 'thinkpress_test' } ])
      }else if (sql === 'SHOW TABLES test') {
        return getPromise([ { 'Tables_in_www.welefen.com': 'thinkpress_cate' },{ 'Tables_in_www.welefen.com': 'thinkpress_post' },{ 'Tables_in_www.welefen.com': 'thinkpress_post_cate' },{ 'Tables_in_www.welefen.com': 'thinkpress_post_tag' },{ 'Tables_in_www.welefen.com': 'thinkpress_tag' },{ 'Tables_in_www.welefen.com': 'thinkpress_test' } ])
      };
      return getPromise([]);
    })
  })
})

describe('MysqlDb', function(){
  it('connect', function(){
    var instance = MysqlDb();
    assert.equal(instance.connect({}) instanceof MysqlSocket, true)
  })
  it('query', function(done){
    var instance = MysqlDb({});
    instance.query('SELECT 1').then(function(data){
      assert.deepEqual(data, [])
      done();
    })
  })
  it('query waiting', function(done){
    var instance = MysqlDb({});
    var p1 = instance.query('SELECT 1').then(function(data){
      assert.deepEqual(data, [])
    })
    var p2 = instance.query('SELECT 1').then(function(data){
      assert.deepEqual(data, [])
    })
    Promise.all([p1, p2]).then(function(){
      done();
    })
  })
  it('bufferToString', function(){
    var instance = MysqlDb({});
    assert.deepEqual(instance.bufferToString({}), {});
  })
  it('bufferToString1', function(){
    var instance = MysqlDb({});
    C('db_buffer_tostring', true);
    assert.deepEqual(instance.bufferToString([]), [])
    assert.deepEqual(instance.bufferToString([1]), [1]);
  })
  it('bufferToString2', function(){
    var instance = MysqlDb({});
    C('db_buffer_tostring', true);
    var buffer = new Buffer('12')
    assert.deepEqual(instance.bufferToString([{key: buffer}]), [{key: '12'}])
    assert.deepEqual(instance.bufferToString([{key: buffer, key1: '12'}]), [{key: '12', key1: '12'}])
  })
  it('execute update', function(){
    var instance = MysqlDb({});
    instance.execute("UPDAET think_user set name='222'").then(function(affectedRows){
      assert.equal(affectedRows, 0);
      done();
    })
  })
  it('execute update with affectedRows', function(){
    var instance = MysqlDb({});
    instance.execute("UPDAET think_user set name='333'").then(function(affectedRows){
      assert.equal(affectedRows, 10);
      done();
    })
  })
  it('execute insert', function(){
    var instance = MysqlDb({});
    instance.execute("INSERT think_user name VALUES('welefen')").then(function(affectedRows){
      assert.equal(affectedRows, 0);
      assert.equal(instance.lastInsertId, 999)
      done();
    })
  })
  it('getFields', function(){
    var instance = MysqlDb({});
    instance.getFields('meinv_session').then(function(data){
      assert.deepEqual(data, {"id":{"name":"id","type":"int(11) unsigned","notnull":false,"default":null,"primary":true,"unique":false,"autoinc":true},"key":{"name":"key","type":"varchar(255)","notnull":false,"default":"","primary":false,"unique":true,"autoinc":false},"data":{"name":"data","type":"text","notnull":false,"default":null,"primary":false,"unique":false,"autoinc":false},"expire":{"name":"expire","type":"bigint(11)","notnull":false,"default":null,"primary":false,"unique":false,"autoinc":false}})
      done();
    })
  })
  it('getTables', function(){
    var instance = MysqlDb({});
    instance.getTables().then(function(data){
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, ["thinkpress_cate","thinkpress_post","thinkpress_post_cate","thinkpress_post_tag","thinkpress_tag","thinkpress_test"])
      done();
    })
  })
  it('getTables test', function(){
    var instance = MysqlDb({});
    instance.getTables('test').then(function(data){
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, ["thinkpress_cate","thinkpress_post","thinkpress_post_cate","thinkpress_post_tag","thinkpress_tag","thinkpress_test"])
      done();
    })
  })
  it('startTrans', function(done){
    var instance = MysqlDb({});
    instance.startTrans().then(function(data){
      assert.equal(data, 0);
      done();
    })
  })
  it('startTrans2', function(done){
    var instance = MysqlDb({});
    instance.startTrans().then(function(data){
      return instance.startTrans();
    }).then(function(data){
      assert.equal(data, undefined)
      done();
    })
  })
  it('commit', function(done){
    var instance = MysqlDb({});
    instance.commit().then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('commit2', function(done){
    var instance = MysqlDb({});
    instance.transTimes = 1;
    instance.commit().then(function(data){
      assert.equal(data, 0)
      done();
    })
  })
  it('rollback', function(done){
    var instance = MysqlDb({});
    instance.rollback().then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('rollback2', function(done){
    var instance = MysqlDb({});
    instance.transTimes = 1;
    instance.rollback().then(function(data){
      assert.equal(data, 0)
      done();
    })
  })
  it('parseKey undefined', function(){
    var instance = MysqlDb({});
    var data = instance.parseKey();
    assert.equal(data, '``')
  })
  it('parseKey string', function(){
    var instance = MysqlDb({});
    var data = instance.parseKey('welefen');
    assert.equal(data, '`welefen`')
  })
  it('parseKey ,', function(){
    var instance = MysqlDb({});
    var data = instance.parseKey('welefen,suredy');
    assert.equal(data, 'welefen,suredy')
  })
  it('getLastInsertId', function(){
    var instance = MysqlDb({});
    var sql = instance.getLastInsertId();
    assert.equal(sql, '')
  })
  it('close', function(){
    var instance = MysqlDb({});
    instance.close();
    assert.equal(instance.linkId, null)
  })
    it('close', function(){
    var instance = MysqlDb({});
    instance.linkId = {close: function(){}}
    instance.close();
    assert.equal(instance.linkId, null)
  })
})