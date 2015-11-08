'use strict';

var assert = require('assert');
var path = require('path');
var muk = require('muk');

var thinkjs = require('../../../lib/index.js');

think.APP_PATH = path.dirname(path.dirname(__dirname)) + '/testApp';

var RedisCache = think.adapter('cache', 'redis');

describe('adapter/cache/redis.js', function() {
  var instance;

  before(function() {
    var tjs = new thinkjs();
    tjs.loadConfig();
    tjs.loadAlias();

    
    instance = new RedisCache(think.config('cache'));

    var data = {};
    
    instance.getRedisInstance = function(){
      return {
        set: function(name, value, timeout) {
          data[name] = {
            name: name,
            value: value,
            timeout: timeout ? Date.now() + timeout * 1e3 : null
          };
          return Promise.resolve();
        },
        get: function(name) {
          if (data[name]) {
            if (data[name].timeout && Date.now() > data[name].timeout) {
              delete data[name];
              return Promise.resolve();
            } else {
              return Promise.resolve(data[name].value);
            }
          }
          return Promise.resolve();
        },
        delete: function(name) {
          delete data[name];
          return Promise.resolve();
        }
      }
    }

    
  });

  it('new file cache instance', function() {
    assert.equal(instance.keyPrefix, think.config('cache.prefix'));
  });

  it('get redis instance', function(){
    var instance = new RedisCache(think.config('cache'));
    var redisIntance = instance.getRedisInstance('test');
    assert.equal(think.isObject(redisIntance), true);
    var redisIntance1 = instance.getRedisInstance('test');
    assert.equal(redisIntance, redisIntance1)
  })

  it('get empty data', function(done) {
    instance.get('thinkjs').then(function(data) {
      assert.equal(data, undefined);
      done();
    });
  });

  it('get data, store error', function(done) {
    var instance = new RedisCache(think.config('cache'));
    instance.getRedisInstance = function(){
      return {
        get: function(){
          return Promise.reject();
        }
      }
    }
    instance.get('thinkjs').then(function(data) {
      assert.equal(data, undefined);
      done();
    });
  });

  it('set data, store error', function(done) {
    var instance = new RedisCache(think.config('cache'));
    instance.getRedisInstance = function(){
      return {
        set: function(){
          return Promise.reject();
        }
      }
    }
    instance.set('thinkjs', 'data').then(function(data) {
      assert.equal(data, undefined);
      done();
    });
  });

  it('delete data, store error', function(done) {
    var instance = new RedisCache(think.config('cache'));
    instance.getRedisInstance = function(){
      return {
        delete: function(){
          return Promise.reject();
        }
      }
    }
    instance.delete('thinkjs').then(function(data) {
      assert.equal(data, undefined);
      done();
    });
  });

  it('set cache data', function(done) {
    instance.set('thinkjs', 'maxzhang').then(function() {
      assert(true);
      done();
    });
  });

  it('set cache data(object)', function(done) {
    instance.set({ 'thinkjs': 'maxzhang' }).then(function() {
      assert(true);
      done();
    });
  });

  it('get cache data', function(done) {
    instance.get('thinkjs').then(function(data) {
      assert.equal(data, 'maxzhang');
      done();
    });
  });

  it('set object data', function(done) {
    instance.set('thinkjs1', { a: 1, b: 2 }).then(function() {
      instance.get('thinkjs1').then(function(data) {
        assert.deepEqual(data, { a: 1, b: 2 });
        done();
      });
    });
  });

  it('remove cache data', function(done) {
    instance.delete('thinkjs1').then(function() {
      instance.get('thinkjs1').then(function(data) {
        assert.equal(data, undefined);
        done();
      });
    });
  });

  it('set data with expire', function(done) {
    instance.set('thinkjs2', 'maxzhang', 0.1).then(function() {
      instance.get('thinkjs2').then(function(value) {
        assert.equal(value, 'maxzhang');
        done();
      });
    });
  });

  it('get expired data', function(done) {
    instance.set('thinkjs2', 'maxzhang', 0.01).then(function() {
      setTimeout(function() {
        instance.get('thinkjs2').then(function(value) {
          assert.equal(value, undefined);
          done();
        });
      }, 15);
    });
  });

});