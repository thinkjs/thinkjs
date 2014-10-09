var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var net = require('net');

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

var FileSession = thinkRequire('FileSession');

describe('FileSession', function(){
  it('init', function(){
    var instance = FileSession({cookie: 'welefen1'});
    assert.equal(instance.key, 'welefen1')
  })
  it('init, options empty', function(){
    var instance = FileSession();
    assert.equal(instance.key, undefined)
  })
  it('initData', function(done){
    var instance = FileSession({cookie: 'welefen2'});
    instance.initData().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('initData', function(done){
    var instance = FileSession({cookie: 'welefen3'});
    var getData = instance.getData;
    instance.getData = function(){
      return getPromise();
    }
    instance.initData().then(function(data){
      assert.deepEqual(data, {});
      instance.getData = getData;
      done();
    })
  })
  it('initData2', function(done){
    var instance = FileSession({cookie: 'welefen4'});
    instance.initData().then(function(){
      return instance.initData();
    }).then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('set', function(done){
    var instance = FileSession({cookie: 'welefen5'});
    instance.set('name', 'welefen').then(function(data){
      assert.deepEqual(instance.data, {name: 'welefen'});
      done();
    })
  })
  it('set with timeout', function(done){
    var instance = FileSession({cookie: 'welefen6'});
    instance.set('name', 'welefen', 1000).then(function(data){
      assert.deepEqual(instance.data, {name: 'welefen'});
      assert.equal(instance.options.timeout, 1000)
      done();
    })
  })
  it('get undefined', function(done){
    var instance = FileSession({cookie: 'welefen7'});
    instance.get('name').then(function(data){
      assert.deepEqual(data , undefined);
      done();
    })
  })
  it('get value', function(done){
    var instance = FileSession({cookie: 'welefen8'});
    instance.set('name', 'welefen').then(function(){
      return instance.get('name');
    }).then(function(data){
      assert.deepEqual(data , 'welefen');
      done();
    })
  })
  it('rm name', function(done){
    var instance = FileSession({cookie: 'welefen9'});
    instance.rm('name').then(function(data){
      assert.deepEqual(instance.data, {});
      done();
    })
  })
  it('rm name', function(done){
    var instance = FileSession({cookie: 'welefen10'});
    instance.initData().then(function(){
      instance.data = {'name': 'welefen'}
    }).then(function(){
      instance.rm('name').then(function(data){
        assert.deepEqual(instance.data, {});
        done();
      })
    })
    
  })
  it('rm name1', function(done){
    var instance = FileSession({cookie: 'welefen11'});
    instance.initData().then(function(){
      instance.data = {'name': 'welefen'}
    }).then(function(){
      instance.rm('name1').then(function(data){
        assert.deepEqual(instance.data, {name: 'welefen'});
        done();
      })
    })
  })
  it('rm all', function(done){
    var instance = FileSession({cookie: 'welefen12'});
    instance.initData().then(function(){
      instance.data = {'name': 'welefen'}
      instance.rm().then(function(data){
        assert.deepEqual(instance.data, {});
        done();
      })
    })
  })
  it('rm all, with flush', function(done){
    var instance = FileSession({cookie: 'welefen13'});
    instance.initData().then(function(){
      instance.data = {'name': 'welefen'}
      instance.rm().then(function(data){
        return instance.flush();
      }).then(function(){
        assert.deepEqual(instance.data, {})
        done();
      })
    })
  })
  it('flush', function(done){
    var instance = FileSession({cookie: 'welefen14'});
    instance.initData().then(function(){
      instance.data = {'name': 'welefen'}
    }).then(function(){
      instance.flush().then(function(){
        done();
      })
    })
  })
})