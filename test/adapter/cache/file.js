'use strict';

var assert = require('assert');
var fs = require('fs');

var thinkjs = require('../../../lib/index.js');

var tjs = new thinkjs();
tjs.loadAlias();

var FileCache = think.adapter('cache', 'file');

describe('adapter/cache/file.js', function() {
  var instance;

  before(function() {
    instance = new FileCache();

    ['thinkjs', 'thinkjs1', 'thinkjs2', 'thinkjs3'].forEach(function(v) {
      var filepath = instance.getFilepath(v);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });
  });

  it('new file cache instance', function() {
    assert.equal(instance.gcType, 'cache_file');
    assert.equal(instance.file_ext, '.json');
    assert.equal(instance.path_depth, 1);
  });

  it('get file path', function() {
    var filepath = instance.getFilepath('maxzhang');
    assert.equal(filepath, instance.path + '/c/cbc21016fc89ec482594a22e03e02834.json');
    filepath = instance.getFilepath('Max Zhang');
    assert.equal(filepath, instance.path + '/5/5e98a6842702de206202d9ddd0a6bbc2.json');
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

  it('run cache gc', function(done) {
    instance.set('thinkjs2', 'maxzhang', 0.1).then(function() {
      setTimeout(function() {
        instance.gc();
        instance.get('thinkjs2').then(function(value) {
          assert.equal(value, undefined);
          done();
        });
      }, 150);
    });
  });

  it('custom data timeout', function(done) {
    var instance = new FileCache({ timeout: 0.1 });
    instance.set('thinkjs3', 'maxzhang', 10).then(function() {
      setTimeout(function() {
        instance.gc();
        instance.get('thinkjs3').then(function(value) {
          assert.equal(value, 'maxzhang');
          done();
        });
      }, 150);
    });
  });

  after(function() {
    think._alias = {};
  });

});