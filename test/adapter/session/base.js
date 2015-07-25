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

var BaseSession = think.adapter('session', 'base');

describe('adapter/session/base', function(){
  it('get instance', function(){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    assert.equal(instance.timeout, 100);
    assert.equal(instance.cookie, 'welefen');
    assert.equal(instance.gcType, 'session_base');
  })
  it('get data, undefined', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.get('welefen').then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('get data, string', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('welefen', 'suredy').then(function(){
      return instance.get('welefen')
    }).then(function(data){
      assert.equal(data, 'suredy');
      done();
    })
  })
  it('get data, object', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('welefen', {name: 'suredy'}).then(function(){
      return instance.get('welefen')
    }).then(function(data){
      assert.deepEqual(data, {name: 'suredy'});
      done();
    })
  })
  it('get data, object 1', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('welefen1', {name: 'suredy'}).then(function(){
      return instance.get('welefen1')
    }).then(function(data){
      assert.deepEqual(data, {name: 'suredy'});
      done();
    })
  })
  it('get data, exipred', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('welefen2', {name: 'suredy'}, 0.01).then(function(){
      setTimeout(function(){
        instance.get('welefen2').then(function(data){
          assert.equal(data, undefined);
          done();
        })
      }, 40)
    })
  })
  it('get all data', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('welefen2', {name: 'suredy'}, 100).then(function(){
      setTimeout(function(){
        instance.get().then(function(data){
          assert.deepEqual(data, { welefen2: { name: 'suredy' } });
          done();
        })
      }, 40)
    })
  })
  it('delete data', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('welefen', 'suredy').then(function(){
      return instance.delete('welefen')
    }).then(function(){
      return instance.get('welefen')
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('delete data, key not exist', function(done){
    var instance = new BaseSession({
      cookie: 'eeeee',
      timeout: 100
    });
    return instance.delete('welefen3333').then(function(){
      return instance.get('welefen3333')
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('delete all', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('name', 'welefen').then(function(){
      return instance.delete()
    }).then(function(){
      return instance.get()
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('gc', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('name', 'welefen', 0.01).then(function(){
      setTimeout(function(){
        instance.gc().then(function(){
          return instance.get();
        }).then(function(data){
          assert.equal(data, undefined);
          done();
        })
      }, 50)
    })
  })
  it('gc', function(done){
    var instance = new BaseSession({
      cookie: 'welefen',
      timeout: 100
    });
    instance.set('name', 'welefen', 0.01).then(function(){
      return instance.set('fasdfasdf', 'fasdfasdf');
    }).then(function(){
      setTimeout(function(){
        instance.gc().then(function(){
          return instance.get();
        }).then(function(data){
          assert.deepEqual(data, { name: 'welefen', fasdfasdf: 'fasdfasdf' });
          done();
        })
      }, 50)
    })
  })
})