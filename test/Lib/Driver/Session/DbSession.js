var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var net = require('net');

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

var MysqlSocket = thinkRequire('MysqlSocket');
var DbSession = thinkRequire('DbSession');

describe('before', function(){
  it('before', function(){
    muk(MysqlSocket.prototype, 'query', function(sql){
      sql = sql.trim();
      if (sql === 'SHOW COLUMNS FROM `think_session`') {
        return getPromise([ 
          { Field: 'id',Type: 'int(11) unsigned',Null: 'NO',Key: 'PRI',Default: null,Extra: 'auto_increment' },
          { Field: 'key',Type: 'varchar(255)',Null: 'NO',Key: 'UNI',Default: '',Extra: '' },
          { Field: 'data',Type: 'text',Null: 'YES',Key: '',Default: null,Extra: '' },
          { Field: 'expire',Type: 'bigint(11)',Null: 'NO',Key: 'MUL',Default: null,Extra: '' } 
        ]);
      }else if (sql === "SELECT * FROM `think_session` WHERE ( `key` = 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_' ) LIMIT 1") {
        return getPromise([ { id: 1,key: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_',data: '{"name":"suredy"}',expire: 1509896404697 } ])
      }else if (sql === "SELECT * FROM `think_session` WHERE ( `key` = 'expired' ) LIMIT 1") {
        return getPromise([ { id: 1,key: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_',data: '{"name":"suredy"}',expire: 1309896404697 } ])
      }else if (sql === "SELECT * FROM `think_session` WHERE ( `key` = 'dataempty' ) LIMIT 1") {
        return getPromise([ { id: 1,key: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_',data: '',expire: 1409896404697 } ])
      }
      return getPromise([]);
    })
  })
})
describe('DbSession', function(){
  it('init', function(){
    var instance = DbSession();
    assert.equal(instance.key, undefined);
    assert.equal(instance.isChanged, false)
  })
  it('init with cookie', function(){
    var instance = DbSession({cookie: 'welefen'});
    assert.equal(instance.key, 'welefen');
    assert.equal(instance.isChanged, false)
  })
  it('initData', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    instance.initData().then(function(data){
      assert.deepEqual(instance.data, {name: 'suredy'})
      done();
    })
  })
  it('initData emtpy data', function(done){
    var instance = DbSession({cookie: 'www-wbkVe-gQO_'});
    instance.initData().then(function(data){
      assert.deepEqual(instance.data, {})
      done();
    })
  })
  it('initData expired data', function(done){
    var instance = DbSession({cookie: 'expired'});
    instance.initData().then(function(data){
      assert.deepEqual(instance.data, {})
      done();
    })
  })
  it('initData data emtpy', function(done){
    var instance = DbSession({cookie: 'dataempty'});
    instance.initData().then(function(data){
      assert.deepEqual(instance.data, {})
      done();
    })
  })
  it('initData2', function(done){
    var instance = DbSession({cookie: 'dataempty'});
    instance.initData().then(function(){
      return instance.initData();
    }).then(function(data){
      assert.deepEqual(instance.data, {})
      done();
    })
  })
  it('get value undefined', function(done){
    var instance = DbSession({cookie: 'werwer'});
    instance.get('name').then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('get value', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    instance.get('name').then(function(data){
      assert.equal(data, 'suredy');
      done();
    })
  })
  it('set value', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    instance.set('name', 'welefen').then(function(data){
      assert.deepEqual(instance.data, {name: 'welefen'});
      done();
    })
  })
  it('set value', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    instance.set('value', 'welefen').then(function(data){
      assert.deepEqual(instance.data, {name: 'suredy', value: 'welefen'});
      done();
    })
  })
  it('rm name not exist', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    instance.rm('value').then(function(data){
      assert.deepEqual(instance.data, {name: 'suredy'});
      done();
    })
  })
  it('rm name', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    instance.rm('name').then(function(data){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('rm all', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    instance.rm().then(function(data){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('flush', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    var now = Date.now;
    Date.now = function(){
      return 1409837426812;
    }
    instance.flush().then(function(data){
      var sql = instance.model.getLastSql().trim();
      assert.equal(sql, "UPDATE `think_session` SET `expire`=1409859026812 WHERE ( `key` = 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_' )")
      Date.now = now;
      done();
    })
  })
  it('flush changed data', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    var now = Date.now;
    Date.now = function(){
      return 1409859026812;
    }
    instance.isChanged = true;
    instance.flush().then(function(data){
      var sql = instance.model.getLastSql().trim();
      var s = "UPDATE `think_session` SET `expire`=1409880626812,`data`='{\\\"name\\\":\\\"suredy\\\"}' WHERE ( `key` = 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_' )";
      assert.equal(sql, s)
      Date.now = now;
      done();
    })
  })
  it('gc', function(done){
    var instance = DbSession({cookie: 'Nru4DV9uYy3jUP8_MDl4l-wbkVe-gQO_'});
    var now = 1409859026812;
    instance.gc(now).then(function(){
      var sql = instance.model.getLastSql().trim();
      var s = "DELETE FROM `think_session` WHERE ( `expire` < 1409859026812 )";
      assert.equal(sql, s)
      done();
    })
  })
})

describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})