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

var MemcacheCache = thinkRequire('MemcacheCache');
var MemcacheSocket = thinkRequire('MemcacheSocket')

describe('before', function(){
  it('before', function(){
    muk(MemcacheSocket.prototype, 'get', function(name){
      var data;
      if (name === '__thinkjs__json') {
        data = JSON.stringify({name: 'welefen'})
      };
      return getPromise(data);
    })
    muk(MemcacheSocket.prototype, 'set', function(name, value, timeout){
      return getPromise({
        name: name, 
        value: value,
        timeout: timeout
      });
    })
    muk(MemcacheSocket.prototype, 'delete', function(name){
      return getPromise({
        name: name
      });
    })
  })
})

describe('MemcacheCache', function(){
  it('init', function(){
    var instance = MemcacheCache();
    var namePrefix = instance.namePrefix;
    assert.equal(namePrefix, C('cache_key_prefix'));
  })
  it('init, same instance', function(){
    var instance = MemcacheCache();
    var instance2 = MemcacheCache();
    assert.equal(instance.handle, instance2.handle);
  })
  it('get', function(done){
    var instance = MemcacheCache();
    instance.get('name').then(function(data){
      assert.equal(data, undefined)
      done();
    })
  })
  it('get json', function(done){
    var instance = MemcacheCache();
    instance.get('json').then(function(data){
      assert.deepEqual(data, {name: 'welefen'})
      done();
    })
  })
  it('set', function(done){
    var instance = MemcacheCache();
    instance.set('json', 'welefen').then(function(data){
      //console.log(data)
      assert.deepEqual(data, { name: '__thinkjs__json', value: '"welefen"', timeout: 21600 })
      done();
    })
  })
  it('rm', function(done){
    var instance = MemcacheCache();
    instance.rm('json', 'welefen').then(function(data){
      //console.log(data)
      assert.deepEqual(data, { name: '__thinkjs__json'})
      done();
    })
  })
})


describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})