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

var RedisSession = think.adapter('session', 'redis');

describe('adapter/session/redis', function(){
  it('get instance, no options', function(){
    var instance = new RedisSession();
    assert.equal(instance.gcType, undefined);
    //assert.equal(instance.cookie, undefined);
  })
  it('get instance', function(){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    assert.equal(instance.gcType, undefined);
    assert.equal(instance.cookie, 'welefen');
  })
  it('get redis instance', function(){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.parseConfig = function(a, b, options){
      assert.equal(options.from, 'session')
      return options;
    }
    var redis = instance.getRedisInstance('get');
    assert.equal(think.isObject(redis), true)
  })
  it('get redis instance, exist', function(){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.parseConfig = function(options){
      assert.equal(options.from, undefined)
      return options;
    }
    var redis = instance.getRedisInstance('get');
    assert.equal(think.isObject(redis), true);
    muk.restore();
  })
  it('getData, exist', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.data = {name: 'thinkjs'};
    instance.getData().then(function(data){
      assert.deepEqual(data, {name: 'thinkjs'});
      done();
    })
  })
  it('getData, from redis, empty', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getRedisInstance = function(){
      return {
        get: function(cookie){
          assert.equal(cookie, 'welefen');
          return Promise.resolve(null)
        }
      }
    }
    instance.getData().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('getData, from redis, empty 1', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getRedisInstance = function(){
      return {
        get: function(cookie){
          assert.equal(cookie, 'welefen');
          return Promise.resolve(null)
        }
      }
    }
    instance.getData()
    instance.getData().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
   it('get, item', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'thinkjs'};
      return Promise.resolve(instance.data);
    }
    instance.get('name').then(function(data){
      assert.deepEqual(data, 'thinkjs');
      done();
    })
  })
  it('get, all', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'thinkjs'};
      return Promise.resolve(instance.data);
    }
    instance.get().then(function(data){
      assert.deepEqual(data, {name: 'thinkjs'});
      done();
    })
  })
  it('set data', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'thinkjs'};
      return Promise.resolve(instance.data);
    }
    instance.set('name', 'value').then(function(data){
      assert.deepEqual(instance.data, {name: 'value'});
      done();
    })
  })
  it('set data, with timeout', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'thinkjs'};
      return Promise.resolve(instance.data);
    }
    instance.set('name', 'value', 1000).then(function(data){
      assert.deepEqual(instance.data, {name: 'value'});
      assert.equal(instance.timeout, 1000)
      done();
    })
  })
  it('delete data, item', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'thinkjs'};
      return Promise.resolve(instance.data);
    }
    instance.delete('name').then(function(data){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('delete data, all', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'thinkjs', value: '1111'};
      return Promise.resolve(instance.data);
    }
    instance.delete().then(function(data){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('flush', function(done){
    var instance = new RedisSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'thinkjs', value: '1111'};
      return Promise.resolve(instance.data);
    }
    instance.getRedisInstance = function(){
      return {
        set: function(name, value, timeout){
          assert.equal(name, 'welefen');
          assert.equal(value, '{"name":"thinkjs","value":"1111"}');
          assert.equal(timeout, 86400)
          return Promise.resolve();
        }
      }
    }
    instance.flush().then(function(data){
      done();
    })
  })
})

