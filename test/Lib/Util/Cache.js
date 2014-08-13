var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path')

global.APP_PATH = path.normalize(__dirname + '/../../App');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));

var Cache = thinkRequire('Cache');

describe('Cache', function(){
  var setIntervalFn = global.setInterval;
  it('before', function(){
    global.setInterval = function(callback, interval){
      callback && callback();
    }
  })
  it('empty options', function(){
    var instance = Cache();
    assert.deepEqual(instance.options, { timeout: 21600 });
  })
  it('gctype options', function(){
    var instance = Cache({
      gcType: 'Cache'
    });
    assert.deepEqual(instance.options, { timeout: 21600, gcType: 'Cache' });
  })
  it('timeout options', function(){
    var instance = Cache({
      timeout: 100
    });
    assert.deepEqual(instance.options, { timeout: 100 });
  })
  it('gc', function(){
    APP_MODE = '';
    APP_DEBUG = false
    var instance = Cache({
      timeout: 100
    });
  })
  it('gc hour', function(){
    APP_MODE = '';
    APP_DEBUG = false;
    var hour = (new Date()).getHours();
    C('cache_gc_hour', [hour])
    var instance = Cache({
      timeout: 100
    });
    C('cache_gc_hour', [])
  })
  it('get undefined', function(done){
    var instance = Cache();
    instance.cacheData = {};
    instance.get('name').then(function(data){
      assert.deepEqual(data, undefined);
      done();
    })
  })
  it('get data', function(done){
    var instance = Cache();
    instance.set('name', 'welefen').then(function(){
      return instance.get('name');
    }).then(function(data){
      assert.deepEqual(data, 'welefen');
      done();
    })
  })
  it('get data expired', function(done){
    var instance = Cache();
    instance.set('name1', 'welefen', -100).then(function(){
      return instance.get('name1');
    }).then(function(data){
      assert.deepEqual(data, undefined);
      done();
    })
  })
  it('get updateExpire', function(done){
    var instance = Cache({updateExpire: true});
    instance.set('name2', 'welefen', 100).then(function(){
      return instance.get('name2');
    }).then(function(data){
      assert.deepEqual(data, 'welefen');
      done();
    })
  })
  it('get mixed data', function(done){
    var instance = Cache({updateExpire: true});
    var data = {name: 'welefen'};
    instance.set('name2', data, 100).then(function(){
      return instance.get('name2');
    }).then(function(d){
      assert.deepEqual(data, d);
      data.value = 'suredy';
      assert.deepEqual(d, {name: 'welefen'})
      done();
    })
  })
  it('get array', function(done){
    var instance = Cache({updateExpire: true});
    var data = [1, 2, 3]
    instance.set('name2', data, 100).then(function(){
      return instance.get('name2');
    }).then(function(d){
      assert.deepEqual(data, d);
      data.push(4);
      assert.deepEqual(d, [1, 2, 3])
      done();
    })
  })
  it('rm', function(done){
    var instance = Cache({updateExpire: true});
    instance.cacheData = {name2: {data: {}}}
    instance.rm('name').then(function(){
      assert.deepEqual(Object.keys(instance.cacheData), ['name2'])
      done();
    })
  })
  it('rm empty', function(done){
    var instance = Cache({updateExpire: true});
    instance.key = 'name';
    instance.cacheData = {};
    instance.rm('name').then(function(){
      assert.deepEqual(instance.cacheData, {})
      done();
    })
  })
  it('rm empty', function(done){
    var instance = Cache({updateExpire: true});
    instance.key = 'name';
    instance.cacheData = {name: {data: {}}};
    instance.rm('name').then(function(){
      //console.log(instance.cacheData)
      assert.deepEqual(instance.cacheData, { name: { data: {} } })
      done();
    })
  })
  it('gc empty', function(){
    var instance = Cache({updateExpire: true});
    instance.cacheData = {};
    instance.gc(1);
    assert.deepEqual(instance.cacheData, {})
  })
  it('gc not expired', function(){
    var instance = Cache({updateExpire: true});
    instance.cacheData = {name: {expire: Date.now() + 1000000, data: {}}};
    instance.gc(1);
    assert.deepEqual(instance.cacheData, {name: {expire: Date.now() + 1000000, data: {}}})
  })
  it('gc expired', function(){
    var instance = Cache({updateExpire: true});
    instance.cacheData = {name: {expire: Date.now() - 1000000, data: {}}};
    instance.gc(Date.now());
    assert.deepEqual(instance.cacheData, {})
  })
  it('after', function(){
    global.setInterval = setIntervalFn;
  })
})