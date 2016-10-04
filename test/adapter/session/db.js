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

var DbSession = think.adapter('session', 'db');

describe('adapter/session/db', function(){
  it('get instance, no options', function(){
    var instance = new DbSession();
    assert.equal(instance.gcType, 'session_db');
    assert.deepEqual(instance.cookie, {length: 32});
  })
  it('get instance', function(){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    assert.equal(instance.gcType, 'session_db');
    assert.equal(instance.cookie, 'welefen');
  })
  it('get data, has data', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.data = {name: 'thinkjs'};
    instance.getData().then(function(data){
      assert.deepEqual(data, {name: 'thinkjs'});
      done();
    })
  })
  it('get data, data empty', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.model.find = function(){
      return {};
    }
    instance.model.add = function(options){
      assert.equal(options.cookie, 'welefen')
    }
    instance.getData().then(function(){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('get data, data is expired', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.model.find = function(){
      return {expire: Date.now() - 10000};
    }
    instance.getData().then(function(){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('get data, normal', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.model.find = function(){
      return {expire: Date.now() + 100000, data: JSON.stringify({name: 'thinkjs', value: '2.0'})};
    }
    instance.getData().then(function(){
      assert.deepEqual(instance.data, {name: 'thinkjs', value: '2.0'});
      done();
    })
  })
   it('get data, normal 2', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.model.find = function(){
      return {expire: Date.now() + 100000, data: JSON.stringify({name: 'thinkjs', value: '2.0'})};
    }
    //get data multi 
    instance.getData();
    instance.getData().then(function(){
      assert.deepEqual(instance.data, {name: 'thinkjs', value: '2.0'});
      done();
    })
  })
  it('get data, parse error', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.model.find = function(){
      return {expire: Date.now() + 100000, data: 'not json data'};
    }
    instance.getData().then(function(){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('get data, parse empty data', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.model.find = function(){
      return {expire: Date.now() + 100000, data: null};
    }
    instance.getData().then(function(){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('get data, newCookie', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.model = {
      add: () => Promise.resolve()
    };
    instance.newCookie = true;
    instance.get().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  });
  it('get data, all', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'wwww'}
      return Promise.resolve();
    }
    instance.get().then(function(data){
      assert.deepEqual(data, {name: 'wwww'});
      done();
    })
  })
  it('get data, all 1', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'wwww'};
      return Promise.resolve();
    }
    instance.get();
    instance.get().then(function(data){
      assert.deepEqual(data, {name: 'wwww'});
      done();
    })
  })
  it('get data, item', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'wwww'}
      return Promise.resolve();
    }
    instance.get('name').then(function(data){
      assert.deepEqual(data, 'wwww');
      done();
    })
  })
  it('set data', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'wwww'}
      return Promise.resolve();
    }
    instance.set('name', 'test').then(function(data){
      assert.deepEqual(instance.isChanged, true);
      assert.deepEqual(instance.data, {name: 'test'})
      done();
    })
  })
  it('set data, with timeout', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'wwww'}
      return Promise.resolve();
    }
    instance.set('name', 'test', 1000).then(function(data){
      assert.deepEqual(instance.isChanged, true);
      assert.deepEqual(instance.data, {name: 'test'})
      assert.equal(instance.timeout, 1000)
      done();
    })
  })
  it('delete data, item', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'wwww'}
      return Promise.resolve();
    }
    instance.delete('name').then(function(data){
      assert.deepEqual(instance.isChanged, true);
      assert.deepEqual(instance.data, {})
      done();
    })
  })
  it('delete data, all', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'wwww', value: '2222'}
      return Promise.resolve();
    }
    instance.delete().then(function(data){
      assert.deepEqual(instance.isChanged, true);
      assert.deepEqual(instance.data, {})
      done();
    })
  })
  it('flush, unchanged', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {}
      return Promise.resolve();
    }
    instance.flush().then(function(data){
      assert.deepEqual(instance.isChanged, false);
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('flush, getted', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'www'}
      return Promise.resolve();
    }
    instance.model.update = function(data){
      assert.equal(data.data, undefined);
    }
    instance.flush().then(function(data){
      assert.deepEqual(instance.isChanged, false);
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('flush, data changed', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'www'}
      return Promise.resolve();
    }
    instance.model.update = function(data){
      assert.deepEqual(JSON.parse(data.data), { name: 'www' });
    }
    instance.isChanged = true;
    instance.flush().then(function(data){
      assert.deepEqual(instance.isChanged, true);
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('gc', function(done){
    var instance = new DbSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.getData = function(){
      instance.data = {name: 'www'}
      return Promise.resolve();
    }
    var flag = false;
    instance.model.delete = function(){
      flag = true;
      return Promise.resolve();
    }
    instance.gc().then(function(){
      assert.equal(flag, true)
      done();
    })
  })
})

