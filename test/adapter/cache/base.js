'use strict';

var assert = require('assert');

var thinkjs = require('../../../lib/index.js');

var tjs = new thinkjs();
tjs.loadAlias();

var BaseCache = think.adapter('cache', 'base');

describe('adapter/cache/base.js', function() {
  var instance;

  before(function() {
    instance = new BaseCache();
  });

  it('new base cache instance', function() {
    assert.deepEqual(instance.data, {});
  });

  it('set cache data', function(done) {
    instance.set('thinkjs', 'maxzhang').then(function() {
      assert(true);
      done();
    });
  });

  it('set cache data with expire', function(done) {
    instance.set('thinkjs1', 'maxzhang', 10).then(function() {
      assert(true);
      done();
    });
  });

  it('get empty data', function(done) {
    instance.get('thinkjs11').then(function(value) {
      assert.equal(value, undefined);
      done();
    });
  });

  it('get cache data', function(done) {
    instance.get('thinkjs').then(function(value) {
      assert(value, 'maxzhang');
      done();
    });
  });

  it('set cache object data', function(done) {
    var obj = { a: 1 };
    instance.set('thinkjs', { a: 1 }).then(function() {
      obj.a = 2;
      instance.get('thinkjs').then(function(value) {
        assert.deepEqual(value, { a: 1 });
        done();
      });
    });
  });

  it('remove cache data', function(done) {
    instance.delete('thinkjs').then(function() {
      instance.get('thinkjs').then(function(value) {
        assert.equal(value, undefined);
        done();
      });
    });
  });

  it('set data width exprie', function(done) {
    instance.set('thinkjs2', 'maxzhang', 0.1).then(function() {
      instance.get('thinkjs2').then(function(value) {
        assert.equal(value, 'maxzhang');
        done();
      });
    });
  });

  it('get expried data', function(done) {
    instance.set('thinkjs2', 'maxzhang', 0.01).then(function() {
      setTimeout(function() {
        instance.get('thinkjs2').then(function(value) {
          assert.equal(value, undefined);
          done();
        });
      }, 15);
    });
  });

  it('run cache gc', function(done) {
    instance.set('thinkjs3', 'maxzhang', 0.01).then(function() {
      setTimeout(function() {
        instance.gc();
        instance.get('thinkjs3').then(function(value) {
          assert.equal(value, undefined);
          done();
        });
      }, 15);
    });
  });

  it('custom data timeout', function(done) {
    var instance = new BaseCache({ timeout: 0.01 });
    instance.set('thinkjs4', 'maxzhang', 10).then(function() {
      setTimeout(function() {
        instance.gc();
        instance.get('thinkjs4').then(function(value) {
          assert.equal(value, 'maxzhang');
          done();
        });
      }, 15);
    });
  });

  after(function() {

  });

});