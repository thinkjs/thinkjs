var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var Transform = require('../../lib/config/sys/transform.js');

describe('config/transform', function(){
  it('transform keys', function(){
    var keys = Object.keys(Transform).sort();
    assert.deepEqual(keys, [ 'auto_reload_except', 'cache', 'create_server', 'deny_module_list', 'error', 'html_cache', 'output_content', 'post', 'session', 'subdomain' ])
  })
  it('post/json_content_type is function', function(){
    assert.equal(think.isFunction(Transform.post.json_content_type), true)
  })
  it('post/json_content_type transform to array', function(){
    var data = Transform.post.json_content_type('welefen')
    assert.deepEqual(data, ['welefen'])
  })
  it('post/json_content_type error', function(){
    try{
      var data = Transform.post.json_content_type(11212);
      assert.equal(1, 2)
    }catch(e){
    }
  })
  it('post/json_content_type array', function(){
    var data = Transform.post.json_content_type(['javascript/json', 'suredy'])
    assert.deepEqual(data, ['javascript/json', 'suredy'])
  })
  it('cache/type', function(){
    assert.equal(Transform.cache.type('WELEFEN'), 'welefen')
  })
  it('cache/type', function(){
    assert.equal(Transform.cache.type('welefen'), 'welefen')
  })
  it('session/type', function(){
    assert.equal(Transform.session.type('welefen'), 'welefen')
  })
  it('auto_reload_except string', function(){
    var data = Transform.auto_reload_except('welefen');
    assert.deepEqual(data, ['welefen'])
  })
  it('auto_reload_except array', function(){
    var data = Transform.auto_reload_except(['welefen', 'suredy']);
    assert.deepEqual(data, ['welefen', 'suredy'])
  })
  it('auto_reload_except windows platform', function(){
    var data = Transform.auto_reload_except(['welefen', 'suredy/welefen']);
    if(process.platform === 'win32'){
      assert.deepEqual(data, ['welefen', 'suredy\\welefen']);
    }else{
      assert.deepEqual(data, ['welefen', 'suredy/welefen']);
    }
  })
  it('html_cache/rules', function(){
    var data = Transform.html_cache.rules({welefen: 'suredy'});
    assert.deepEqual(data, {welefen: ['suredy']})
  })
  it('html_cache/rules', function(){
    var data = Transform.html_cache.rules({'home:group:detail': 'suredy'});
    assert.deepEqual(data, {'home/group/detail': ['suredy']})
  })
  it('html_cache/rules', function(){
    var fn = function(){}
    var data = Transform.html_cache.rules({'home:group:detail': ['suredy', fn]});
    assert.deepEqual(data, {'home/group/detail': ['suredy', 0, fn]})
  })
  it('create_server undefined', function(){
    var data = Transform.create_server();
    assert.deepEqual(data, undefined)
  })
  it('create_server function', function(){
    var a = function(){}
    var data = Transform.create_server(a);
    assert.deepEqual(data, a)
  })
  it('create_server string, not found', function(){
    try{
      var data = Transform.create_server('create_server_not_found');
      assert.equal(1, 2)
    }catch(e){
      
    }
  })
  it('create_server function', function(){
    global.createServerFnXX = function(){}
    var data = Transform.create_server('createServerFnXX');
    assert.deepEqual(data, createServerFnXX);
    delete global.createServerFnXX;
  })
  it('output_content', function(){
    var data = Transform.output_content();
    assert.deepEqual(data, undefined)
  })
  it('error.callback', function(){
    var data = Transform.error.callback();
    assert.deepEqual(data, undefined)
  })
  it('deny_module_list string', function(){
    var data = Transform.deny_module_list('welefen');
    assert.deepEqual(data, ['welefen'])
  })
  it('deny_module_list, not array', function(){
    try{
      var data = Transform.deny_module_list(1212);
      assert.equal(1, 2)
    }catch(e){
      
    }
  })
  it('deny_module_list array', function(){
    var data = Transform.deny_module_list(['welefen']);
    assert.deepEqual(data, ['welefen'])
  })
  it('subdomain string', function(){
    var data = Transform.subdomain('www.welefen.com');
    assert.deepEqual(data, {value: 'www.welefen.com'})
  })
  it('subdomain array', function(){
    var data = Transform.subdomain(['www.welefen.com']);
    assert.deepEqual(data, {'www.welefen.com': 'www.welefen.com'})
  })
  it('subdomain, number', function(){
    try{
      var data = Transform.subdomain(1212);
      assert.equal(1, 2)
    }catch(e){
      
    }
  })
  it('subdomain object', function(){
    var data = Transform.subdomain({name: 'welefen'});
    assert.deepEqual(data, {name: 'welefen'})
  })
})