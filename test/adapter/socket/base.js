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

var BaseSocket = think.adapter('socket', 'base');

describe('adapter/socket/base', function(){
  it('get instance', function(){
    var instance = new BaseSocket();
    assert.deepEqual(instance.queueNums, 0);
    assert.equal(instance.closeTimer, 0)
  })
  it('log connect', function(){
    var instance = new BaseSocket();
    instance.config = {log_connect: true};
    muk(think, 'log', function(fn, type){
      assert.equal(type, 'SOCKET');
      var str = fn && fn({magenta: function(){}});
      assert.equal(str.indexOf('Connect') > -1, true)
    })
    instance.logConnect();
    muk.restore();
  })
  it('log connect off', function(){
    var instance = new BaseSocket();
    instance.config = {log_connect: false};
    var flag = false;
    muk(think, 'log', function(fn, type){
      flag = true;
    })
    instance.logConnect();
    muk.restore();
    assert.equal(flag, false);
  })
  it('autoClose off', function(){
    var instance = new BaseSocket();
    think.config('auto_close_socket', false);
    var data = instance.autoClose({});
    assert.deepEqual(data, {})
  })
  it('autoClose on', function(done){
    var instance = new BaseSocket();
    think.config('auto_close_socket', true);
    var promise = Promise.resolve();
    var data = instance.autoClose(promise);
    muk(global, 'setTimeout', function(fn){
      fn && fn();
    })
    data.then(function(data){
      think.config('auto_close_socket', false);
      muk.restore();
      done();
    })
  })
  it('autoClose on, queueNums > 0', function(done){
    var instance = new BaseSocket();
    think.config('auto_close_socket', true);
    instance.queueNums = 3;
    var promise = Promise.resolve();
    var data = instance.autoClose(promise);
    data.then(function(data){
      think.config('auto_close_socket', false);
      done();
    })
  })
  it('autoClose on, reject promise', function(done){
    var instance = new BaseSocket();
    think.config('auto_close_socket', true);
    instance.queueNums = 3;
    var promise = Promise.reject();
    var data = instance.autoClose(promise);
    data.catch(function(data){
      think.config('auto_close_socket', false);
      done();
    })
  })
})