var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var net = require('net');

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

var FileSession = thinkRequire('FileSession');

describe('FileSession', function(){
  it('init', function(){
    var instance = FileSession({cookie: 'welefen'});
    assert.equal(instance.key, 'welefen')
  })
  it('init, options empty', function(){
    var instance = FileSession();
    assert.equal(instance.key, undefined)
  })
  it('initData', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.initData().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('initData', function(done){
    var instance = FileSession({cookie: 'welefen'});
    var getData = instance.getData;
    instance.getData = function(){
      return getPromise();
    }
    instance.initData().then(function(data){
      assert.deepEqual(data, {});
      instance.getData = getData;
      done();
    })
  })
  it('initData2', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.initData().then(function(){
      return instance.initData();
    }).then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('set', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.set('name', 'welefen').then(function(data){
      assert.deepEqual(instance.sessionData, {name: 'welefen'});
      done();
    })
  })
  it('set with timeout', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.set('name', 'welefen', 1000).then(function(data){
      assert.deepEqual(instance.sessionData, {name: 'welefen'});
      assert.equal(instance.options.timeout, 1000)
      done();
    })
  })
  it('get undefined', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.get('name').then(function(data){
      assert.deepEqual(data , undefined);
      done();
    })
  })
  it('get value', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.set('name', 'welefen').then(function(){
      return instance.get('name');
    }).then(function(data){
      assert.deepEqual(data , 'welefen');
      done();
    })
  })
  it('rm name', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.rm('name').then(function(data){
      assert.deepEqual(instance.sessionData, {});
      done();
    })
  })
  it('rm name', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.sessionData = {'name': 'welefen'}
    instance.rm('name').then(function(data){
      assert.deepEqual(instance.sessionData, {});
      done();
    })
  })
  it('rm name1', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.sessionData = {'name': 'welefen'}
    instance.rm('name1').then(function(data){
      assert.deepEqual(instance.sessionData, {name: 'welefen'});
      done();
    })
  })
  it('rm all', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.sessionData = {'name': 'welefen'}
    instance.rm().then(function(data){
      assert.deepEqual(instance.sessionData, {});
      done();
    })
  })
  it('flush', function(done){
    var instance = FileSession({cookie: 'welefen'});
    instance.sessionData = {'name': 'welefen'}
    instance.flush().then(function(){
      done();
    })
  })
})