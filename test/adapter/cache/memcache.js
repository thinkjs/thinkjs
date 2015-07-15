'use strict';

var assert = require('assert');
var muk = require('muk');
var fs = require('fs');
var path = require('path');

var thinkjs = require('../../../lib/index.js');

var testAppPath = path.resolve(__dirname, '../../testApp');
if (!fs.existsSync(testAppPath)) {
  [testAppPath, testAppPath + '/app', testAppPath + '/common', testAppPath + '/www'].forEach(function(v) {
    if (!fs.existsSync(v)) {
      fs.mkdirSync(v);
    }
  });
}

describe('adapter/cache/memcache.js', function() {
  var instance;

  before(function() {
    var tjs = new thinkjs();
    think.APP_PATH = testAppPath + '/app';
    think.RESOURCE_PATH = testAppPath + '/www';
    tjs.loadConfig();
    tjs.loadAlias();

    var MemcacheCache = think.adapter('cache', 'memcache');
    instance = new MemcacheCache(think.config('cache'));

    var data = {};
    muk(instance.memcache, 'set', function(name, value, timeout) {
      data[name] = {
        name: name,
        value: value,
        timeout: timeout ? Date.now() + timeout * 1e3 : null
      };
      return Promise.resolve();
    });
    muk(instance.memcache, 'get', function(name) {
      if (data[name]) {
        if (data[name].timeout && Date.now() > data[name].timeout) {
          delete data[name];
          return Promise.resolve();
        } else {
          return Promise.resolve(data[name].value);
        }
      }
      return Promise.resolve();
    });
    muk(instance.memcache, 'delete', function(name) {
      delete data[name];
      return Promise.resolve();
    });
  });

  it('new file cache instance', function() {
    assert.equal(instance.keyPrefix, think.config('cache.prefix'));
  });

  it('get empty data', function(done) {
    instance.get('thinkjs').then(function(data) {
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
    instance.rm('thinkjs1').then(function() {
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
    instance.set('thinkjs2', 'maxzhang', 0.1).then(function() {
      setTimeout(function() {
        instance.get('thinkjs2').then(function(value) {
          assert.equal(value, undefined);
          done();
        });
      }, 150);
    });
  });

  after(function() {
    // think._alias = {};
    // think._config = {};
    think.APP_PATH = think.RESOURCE_PATH = testAppPath;
    think.rmdir(testAppPath);
    // think.cli = false;
    // think.mode = think.mode_mini;
    // think.module = [];
  });

});