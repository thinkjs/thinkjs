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

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var fileStore = think.adapter('store', 'file');

describe('adapter/store/base', function(){
  it('get instance has path', function(){
    var instance = new fileStore({
      path: think.APP_PATH + '/fileStore'
    });
    assert.deepEqual(instance.config, { path: think.APP_PATH + '/fileStore' });
  })
  it('get instance path empty', function(){
    var flag = false;
    try{
      var instance = new fileStore({
        path: ''
      });
    }catch(e){
      flag = true;
    }
    assert.equal(flag, true)
  })
  it('get data, undefined', function(done){
    var instance = new fileStore({
      path: think.APP_PATH + '/fileStore'
    });
    instance.get('test').then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('get data', function(done){
    var instance = new fileStore({
      path: think.APP_PATH + '/fileStore'
    });
    instance.set('test', 'welefen').then(function(){
      return instance.get('test');
    }).then(function(data){
      assert.equal(data, 'welefen');
      done();
    })
  })
  it('delete data', function(done){
    var instance = new fileStore({
      path: think.APP_PATH + '/fileStore'
    });
    instance.set('test', 'welefen').then(function(){
      return instance.delete('test');
    }).then(function(){
      return instance.get('test');
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('delete file, not exist', function(done){
    var instance = new fileStore({
      path: think.APP_PATH + '/fileStore'
    });
    instance.set('test', 'welefen').then(function(){
      return instance.delete('testwwww');
    }).then(function(){
      return instance.get('test');
    }).then(function(data){
      assert.equal(data, 'welefen');
      done();
    })
  })
  it('get all files', function(done){
    var instance = new fileStore({
      path: think.APP_PATH + '/fileStore'
    });
    instance.set('test', 'welefen').then(function(){
      return instance.list();
    }).then(function(data){
      assert.deepEqual(data, ['test']);
      done();
    })
  })
  it('remove files', function(done){
      think.rmdir(think.APP_PATH + '/fileStore').then(done);
  })
})

