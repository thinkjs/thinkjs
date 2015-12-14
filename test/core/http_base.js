var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var _http = require('../_http.js');

var thinkjs = require('../../lib/index.js');

var tjs = new thinkjs();
tjs.load();


var Base = require('../../lib/core/http_base.js');


var list = ['init', 'invoke', 'config', 'action', 'cache', 'hook', 'model', 'controller', 'service'];

describe('core/http_base.js', function(){
  it('Base is function', function(){
    assert.equal(typeof Base, 'function')
  })
  list.forEach(function(item){
    it(item + ' is function', function(){
      var instance = new Base({});
      assert.equal(typeof instance[item], 'function');
    })
  })
  it('get cache', function(done){
    var instance = new Base({});
    instance.cache('xxx', undefined, {type: 'memory'}).then(function(data){
      assert.equal(data, undefined)
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('exec hook', function(done){
    var instance = new Base({res: {}, req: {}});
    instance.hook('testdd', {}).then(function(data){
      assert.deepEqual(data, {})
      done();
    })
  })
  it('service', function(){
    var instance = new Base({res: {}, req: {}});
    var cls = instance.service('fasdfasdfasfww', {});
    assert.equal(think.isFunction(cls), true)
  })
  it('controller not found', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}});
    try{
      var cins = instance.controller('testddd');
      assert.equal(1, 2)
    }catch(e){

    }
  })
  it('model', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}, module: 'home'});
    var model = instance.model('user');
    assert.equal(think.isObject(model), true)
  })
  it('model, empty', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}, module: 'home'});
    var model = instance.model();
    assert.equal(think.isObject(model), true)
  })
  it('model, user', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}, module: 'home'});
    var model = instance.model('user', {});
    assert.equal(think.isObject(model), true)
  })
  it('action, controller not found', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}, module: 'home'});
    try{instance.action('user', 'test');
      assert.equal(1, 2)
    }catch(e){}
  })
  it('action, test', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}, module: 'home'});
    instance.action({
      invoke: function(action){
        assert.equal(action, 'testAction')
      }
    }, 'test')
  })
  it('action, test_add', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}, module: 'home'});
    instance.action({
      invoke: function(action){
        assert.equal(action, 'testAddAction')
      }
    }, 'test_add')
  })
  it('action, __call', function(){
    var instance = new Base({res: {}, req: {}, view: function(){}, module: 'home'});
    instance.action({
      invoke: function(action){
        assert.equal(action, '__call')
      }
    }, '__call')
  })
})