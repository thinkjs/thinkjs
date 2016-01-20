'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var thinkit = require('thinkit');


for(var filepath in require.cache){
  delete require.cache[filepath];
}
var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';


var _http = require('../_http.js');

function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';
  var req = think.extend({}, _http.req);
  var res = think.extend({}, _http.res);
  return think.http(req, res).then(function(http){
    if(config){
      http._config = config;
    }
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return http;
  })
}



describe('core/think.js', function(){
  it('before', function(){
    think.cli = '';
    think.mode = think.mode_normal;
    think.module = [];
  })

  it('methods from thinkit', function(){
    for(var name in thinkit){
      assert.equal(typeof think[name] === 'function' || think[name] === thinkit[name], true);
    }
  })
  it('think.startTime is number', function(){
    assert.equal(typeof think.startTime, 'number')
  })
  it('think.dirname', function(){
    assert.deepEqual(think.dirname, {
      config: 'config',
      controller: 'controller',
      model: 'model',
      adapter: 'adapter',
      logic: 'logic',
      service: 'service',
      view: 'view',
      middleware: 'middleware',
      runtime: 'runtime',
      common: 'common',
      bootstrap: 'bootstrap',
      locale: 'locale'
    })
  })
  it('think.port is number', function(){
    assert.equal(typeof think.port, 'number');
  })
  it('think.cli is string', function(){
    assert.equal(typeof think.cli, 'string');
  })

  it('think.lang is set', function(){
    assert.equal(typeof think.lang === 'string', true);
  })

  it('think.mode is 2', function(){
    assert.equal(think.mode, 2);
  })
  it('think.mode_normal is 2', function(){
    assert.equal(think.mode_normal, 2);
  })
  it('think.mode_module is 4', function(){
    assert.equal(think.mode_module, 4);
  })

  it('think.THINK_LIB_PATH is string', function(){
    assert.equal(typeof think.THINK_LIB_PATH, 'string');
  })
  it('think.THINK_PATH is string', function(){
    assert.equal(typeof think.THINK_PATH, 'string');
  })
  it('think.version is string', function(){
    assert.equal(typeof think.version, 'string');
  })
  it('think.module is empty array', function(){
    assert.deepEqual(think.module, []);
  })

  it('think.base is class', function(){
    assert.deepEqual(typeof think.base, 'function');
  })
  it('think.base methods', function(){
    var instance = new think.base();
    var methods = ['init', 'invoke', 'config', 'action', 'cache', 'hook', 'model', 'controller', 'service'];
    methods.forEach(function(item){
      assert.deepEqual(typeof instance.init, 'function');
    })
  })
  it('think.defer is function', function(){
    assert.equal(typeof think.defer, 'function')
  })
  it('think.defer methods', function(){
    var deferred = think.defer();
    assert.equal(typeof deferred.promise, 'object')
    assert.equal(typeof deferred.resolve, 'function')
    assert.equal(typeof deferred.reject, 'function')
  })
  it('think.promisify is a function', function(){
    assert.equal(typeof think.promisify, 'function');
  })
  it('think.promisify readFile', function(done){
    var readFile = think.promisify(fs.readFile, fs);
    readFile(__filename, 'utf-8').then(function(content){
      assert.equal(content.indexOf('think.promisify readFile') > -1, true);
      done();
    })
  })
  it('think.promisify readFile error', function(done){
    muk(fs, 'readFile', function(file, encoding, callback){
      callback && callback(new Error('think.promisify readFile error'))
    })
    var readFile = think.promisify(fs.readFile, fs);
    readFile(__filename, 'utf-8').catch(function(err){
      assert.equal(err.message, 'think.promisify readFile error');
      muk.restore();
      done();
    })
  })
  it('think.reject is function', function(){
    assert.equal(typeof think.reject, 'function')
  })
  it('think.reject methods', function(done){
    var err = new Error('reject error');
    var timeout = global.setTimeout;
    var log = think.log;

    think.log = function(error){
      assert.equal(err, error)
    }
    global.setTimeout = function(callback, timeout){
      callback && callback();
      assert.equal(timeout, 500);
    }
    var reject = think.reject(err);
    reject.catch(function(e){
      assert.equal(err, e);
      global.setTimeout = timeout;
      think.log = log;
      done();
    })
  })

  it('think.isHttp', function(){
    assert.equal(think.isHttp(), false);
    assert.equal(think.isHttp(null), false);
    assert.equal(think.isHttp([]), false);
    assert.equal(think.isHttp({}), false);
    assert.equal(think.isHttp({req: {}, res: {}}), true);
  })
  it('think.co is function', function(){
    assert.equal(typeof think.co, 'function');
    assert.equal(typeof think.co.wrap, 'function');
  })
  it('think.Class is function', function(){
    assert.equal(typeof think.Class, 'function');
  })
  it('think.Class({})', function(){
    var cls = think.Class({});
    var instance = new cls();
    assert.equal('__initReturn' in instance, true);
    // assert.equal(typeof instance.config, 'function');
    // assert.equal(typeof instance.controller, 'function');
  })
  it('think.Class({}, true)', function(){
    var cls = think.Class({}, true);
    var instance = new cls();
    assert.equal('__initReturn' in instance, false);
    assert.equal(typeof instance.config, 'undefined');
    assert.equal(typeof instance.controller, 'undefined');
  })
  it('think.Class(function)', function(){
    var A = function(){}
    A.prototype = {
      test: function(){
        return 'test'
      }
    }
    var cls = think.Class(A);
    var instance = new cls();
    assert.equal('__initReturn' in instance, false);
    assert.equal(typeof instance.test, 'function');
    assert.equal(instance.test(), 'test');
    assert.equal(typeof instance.controller, 'undefined');
  })
  it('think.Class(function, {})', function(){
    var A = function(){}
    A.prototype = {
      test: function(){
        return 'test';
      }
    }
    var cls = think.Class(A, {
      getName: function(){
        return this.test();
      }
    });
    var instance = new cls();
    assert.equal('__initReturn' in instance, false);
    assert.equal(typeof instance.test, 'function');
    assert.equal(instance.test(), 'test');
    assert.equal(typeof instance.controller, 'undefined');
    assert.equal(instance.getName(), 'test');
  })
  it('think.Class controller is a function', function(){
    var fn = think.Class('controller');
    assert.equal(typeof fn, 'function');
  })
  it('think.Class controller({}) is a function', function(){
    var fn = think.Class('controller');
    var cls = fn({});
    assert.equal(typeof cls, 'function');
  })
  it('think.Class controller() is function', function(){
    var fn = think.Class('controller');
    var cls2 = fn();
    assert.equal(typeof cls2, 'function');
  })
  it('think.Class controller("controller_base") is function', function(){
    var fn = think.Class('controller');
    var cls2 = fn('controller_base');
    assert.equal(typeof cls2, 'function');
  })
  it('think.Class controller(superClass)', function(){
    var fn = think.Class('controller');
    var A = function(){}
    A.prototype = {
      test: function(){
        return 'test';
      }
    }
    var cls = fn(A);
    assert.equal(typeof cls, 'function');
    var instance = new cls();
    assert.equal(instance.test(), 'test');
  })


  it('think.lookClass("module/not/found") not found', function(){
    try{
      think.lookClass('module/not/found')
    }catch(e){
      var message = e.message;
      assert.equal(message.indexOf('module/not/found') > -1, true);
    }
  })
  it('think.lookClass("module/is/exist") is function', function(){
    thinkData.export['module/is/exist'] = function(){
      return 'module/is/exist';
    }
    var fn = think.lookClass('module/is/exist');
    assert.equal(fn(), 'module/is/exist');
    delete thinkData.export['module/is/exist'];
  })
  it('think.lookClass("home/group", "controller") not found', function(){
    var modules = think.module;
    think.module = ['home'];
    try{
      think.lookClass("home/group", "controller")
    }catch(e){
      assert.equal(e.message.indexOf('home/controller/group') > -1, true);
    }
    think.module = modules;
  })
  it('think.lookClass("home/group", "service") is function', function(){
    var modules = think.module;
    think.module = ['home'];
    thinkData.export['home/service/group'] =function(){
      return 'home/service/group';
    }
    var fn = think.lookClass("home/group", "service");
    assert.equal(fn(), 'home/service/group');
    delete thinkData.export['home/service/group'];
    think.module = modules;
  })
  it('think.lookClass("detail", "controller", "homwwwe") not found', function(){
    var cls = think.lookClass('detail', 'controller', 'homwwwe', 'homwwww');
    assert.equal(cls, null);
  })
  it('think.lookClass("group", "controller", "home") is function', function(){
    thinkData.export['home/controller/group'] = function(){
      return 'home/controller/group';
    }
    var fn = think.lookClass('group', 'controller', 'home');
    assert.equal(fn(), 'home/controller/group');
    delete thinkData.export['home/controller/group'];
  })
  it('think.lookClass("group", "controller", "home1") is function', function(){
    var mode = think.mode;
    think.mode = think.mode_module;
    thinkData.export['common/controller/group'] = function(){
      return 'common/controller/group';
    }
    var fn = think.lookClass('group', 'controller', 'home1');
    assert.equal(fn(), 'common/controller/group');
    think.mode = mode;
    delete thinkData.export['common/controller/group'];
  })

  it('think.getPath is function', function(){
    assert.equal(think.isFunction(think.getPath), true);
  })
  it('think.getPath mode normal', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;

    var path = think.getPath();
    assert.equal(path, think.APP_PATH + think.sep + 'controller');
    think.mode = mode;
  })
  it('think.getPath mode normal, has prefix', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;

    var path = think.getPath(undefined, undefined, think.sep + 'prefix');
    //console.log(path)
    assert.equal(path, think.APP_PATH + think.sep + 'prefix' + think.sep + 'controller');
    think.mode = mode;
  })
  it('think.getPath mode normal with model', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;

    var path = think.getPath(think.dirname.common, think.dirname.model);
    assert.equal(path, think.APP_PATH + think.sep + 'model');
    think.mode = mode;
  })
  it('think.getPath mode normal with view', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;

    var path = think.getPath(think.dirname.common, think.dirname.view);
    assert.equal(path, think.APP_PATH + think.sep + 'view');
    think.mode = mode;
  })
  it('think.getPath mode normal', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;
    think.config('default_module', 'home')
    var path = think.getPath();
    assert.equal(path, think.APP_PATH + think.sep + 'controller');
    think.mode = mode;
  })
  it('think.getPath mode normal with controller', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;
    think.config('default_module', 'home')
    var path = think.getPath(undefined, think.dirname.controller);
    assert.equal(path, think.APP_PATH + think.sep + 'controller');
    think.mode = mode;
  })
  it('think.getPath mode normal with view', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;
    think.config('default_module', 'home')
    var path = think.getPath(undefined, think.dirname.view);
    assert.equal(path, think.APP_PATH + think.sep + 'view');
    think.mode = mode;
  })
  it('think.getPath mode normal with view & module', function(){
    var mode = think.mode;
    think.mode = think.mode_normal;
    think.config('default_module', 'home')
    var path = think.getPath('welefen', think.dirname.view);
    assert.equal(path, think.APP_PATH + think.sep + 'view');
    think.mode = mode;
  })
  it('think.getPath mode module', function(){
    var mode = think.mode;
    think.mode = think.mode_module;
    var path = think.getPath();
    assert.equal(path, think.APP_PATH + think.sep + 'common' + think.sep + 'controller');
    think.mode = mode;
  })
  it('think.getPath mode module with model', function(){
    var mode = think.mode;
    think.mode = think.mode_module;
    var path = think.getPath(undefined, think.dirname.model);
    assert.equal(path, think.APP_PATH + think.sep + 'common' + think.sep + 'model');
    think.mode = mode;
  })
  it('think.getPath mode module with model & module', function(){
    var mode = think.mode;
    think.mode = think.mode_module;
    var path = think.getPath('test', think.dirname.model);
    assert.equal(path, think.APP_PATH + think.sep + 'test' + think.sep + 'model');
    think.mode = mode;
  })
  
  it('think.require is function', function(){
    assert.equal(think.isFunction(think.require), true)
  })
  it('think.require({})', function(){
    var data = think.require({});
    assert.deepEqual(data, {})
  })
  it('think.require is in aliasExport', function(){
    var data = thinkData.export;
    var fn = function(){};
    thinkData.export = {
      '_test_': fn
    }
    var result = think.require('_test_')
    assert.equal(result, fn);
    thinkData.export = data;
  })
  it('think.require is in alias', function(){
    var data = thinkData.alias;
    thinkData.alias = {
      '_test_': __filename + '/a.js'
    }
    var result = think.require('_test_');
    assert.equal(result, null);
    thinkData.alias = data;
  })
  it('think.require is in _alias', function(){
    var data = thinkData.alias
    thinkData.alias = {
      '_test_': path.normalize(__dirname + '/../../lib/index.js')
    }
    var result = think.require('_test_');
    assert.equal(think.isFunction(result), true)
    thinkData.alias = data;
  })

  it('think.require is not in _alias, try it', function(){
    try{
      var result = think.require('_test_ww');
      assert.equal(1, 2)
    }catch(e){
      assert.equal(true, true)
    }
  })
  it('think.require is not in _alias, return null', function(){
    var result = think.require('_test_ww', true);
    assert.equal(result, null)
  })
  it('think.require is not in _alias, mime module', function(){
    var result = think.require('mime');
    assert.equal(think.isObject(result), true)
  })

  it('think.safeRequire is function', function(){
    assert.equal(think.isFunction(think.safeRequire), true)
  })
  it('think.safeRequire absoslute file not exist', function(){
    var data = think.safeRequire('/dddd');
    assert.equal(data, null)
  })
  it('think.safeRequire relative file not exist', function(){
    var log = think.log;
    think.log = function(err){
      assert.equal(err.message, "Cannot find module 'dddd/aaa.js'");
    }
    var data = think.safeRequire('dddd/aaa.js');
    assert.equal(data, null);
    think.log = log;
  })

  it('think.prevent is function', function(){
    assert.equal(think.isFunction(think.prevent), true)
  })
  it('think.prevent', function(done){
    think.prevent().catch(function(err){
      assert.equal(err.message, 'PREVENT_NEXT_PROCESS');
      done();
    })
  })
  it('think.isPrevent is function', function(){
    assert.equal(think.isFunction(think.isPrevent), true)
  })
  it('think.isPrevent', function(done){
    think.prevent().catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })

  it('think.log is function', function(){
    assert.equal(think.isFunction(think.log), true)
  })
  it('think.log', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('test') > -1, true)
    }
    think.log('test');
    console.log = log;
  })
  it('think.log, type is false', function(){
    var data = think.log('www', false);
    assert.equal(data, undefined)
  })
  it('think.log, type is true', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('test') > -1, true)
    }
    think.log('test', true);
    console.log = log;
  })
  it('think.log, showTime is false', function(){
    var data = think.log('www', 'LOG', false);
    assert.equal(data, undefined)
  })
  it('think.log, showTime is true', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('test') > -1, true)
    }
    think.log('test', 'www', true);
    console.log = log;
  })
   it('think.log, msg is object', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('welefen') > -1, true)
    }
    think.log({name: "welefen"}, 'www');
    console.log = log;
  })
   it('think.log, msg is array', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('welefen') > -1, true)
    }
    think.log(['welefen'], 'www');
    console.log = log;
  })
  it('think.log, showTime is null', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('test') > -1, true)
    }
    think.log('test', 'www', null);
    console.log = log;
  })
  it('think.log with type', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('test') > -1, true);
      assert.equal(msg.indexOf('[TEST]') > -1, true);
    }
    think.log('test', 'TEST');
    console.log = log;
  })
  it('think.log with function', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(msg.indexOf('test') > -1, true);
      assert.equal(msg.indexOf('[TEST]') > -1, true);
    }
    think.log(function(){
      return 'test';
    }, 'TEST');
    console.log = log;
  })
  it('think.log with function, has startTime', function(){
    var log = console.log;
    console.log = function(msg){
      assert.equal(/\d+ms/.test(msg), true);
      assert.equal(msg.indexOf('fafasdfasdfasdf') > -1, true);
    }
    think.log(function(){
      var arr = new Array(100);
      return arr.join('fafasdfasdfasdf');
    }, 'TEST', Date.now());
    console.log = log;
  })


  it('think.log with error', function(){
    var log = console.error;
    console.error = function(msg){
      assert.equal(msg.indexOf('test') > -1, true);
    }
    think.log(new Error('test'));
    console.error = log;
  })
  it('think.log with prevent', function(done){
    var error = console.error;
    console.error = function(){
      assert.equal(1, 2);
    }
    think.prevent().catch(function(err){
      think.log(err);
      console.error = error;
      done();
    })
  })

  it('think.config is function', function(){
    assert.equal(think.isFunction(think.config), true);
  })
  it('think.config get all data', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {name: 'welefen'};
    var result = think.config();
    assert.deepEqual(result, {name: 'welefen'});
    thinkData.config.common = data;
  })
  it('think.config set data', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {name: 'welefen'};
    think.config({name: 'welefen'});
    var result = think.config();
    assert.deepEqual(result, {name: 'welefen'});
    thinkData.config.common = data;
  })
  it('think.config get data', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config({name: 'welefen'});
    var result = think.config('name');
    assert.deepEqual(result, 'welefen');
    thinkData.config.common = data;
  })
  it('think.config set data with value', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config('name', 'welefen');
    var result = think.config('name');
    assert.deepEqual(result, 'welefen');
    thinkData.config.common = data;
  })
  it('think.config set data with value 2', function(){
   var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config('name.value', 'welefen');
    var result = think.config('name.value');
    assert.deepEqual(result, 'welefen');
     thinkData.config.common = data;
  })
  it('think.config set data with value 3', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config('name.value', 'welefen');
    var result = think.config('name');
    assert.deepEqual(result, {value: 'welefen'});
    thinkData.config.common = data;
  })
  it('think.config set data with value 4', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config('name.value', 'welefen');
    think.config('name.test', 'suredy')
    var result = think.config('name');
    assert.deepEqual(result, {value: 'welefen', test: 'suredy'});
    thinkData.config.common = data;
  })
  it('think.config set data with value 5', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config('name.value', 'welefen');
    var result = think.config('name.value111');
    assert.deepEqual(result, undefined);
    thinkData.config.common = data;
  })
  it('think.config set data with value 6', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config('name.value', 'welefen');
    var result = think.config('name1111.value111');
    assert.deepEqual(result, undefined);
    thinkData.config.common = data;
  })
  it('think.config set data with value 7', function(){
    var data = thinkData.config.common;
    thinkData.config.common = {};
    think.config([]);
    var result = think.config('name1111.value111');
    assert.deepEqual(result, undefined);
    thinkData.config.common = data;
  })
  it('think.config get value with data', function(){
    var result = think.config('name', undefined, {name: 'welefen'});
    assert.deepEqual(result, 'welefen');
  })
  it('think.config set value with data', function(){
    var data = {name: 'welefen'};
    think.config('name', 'suredy', data);
    assert.deepEqual(data, {name: 'suredy'});
  })
  it('think.config set value with data 2', function(){
    var data = {name: 'welefen'};
    think.config('name1', 'suredy', data);
    assert.deepEqual(data, {name: 'welefen', name1: 'suredy'});
  })
  it('think.config set value with module config', function(){
    think.config('name1', 'suredy', 'test');
    assert.deepEqual(think.config('name1', undefined, 'test'), 'suredy');
  })


  it('think.getModuleConfig is function', function(){
    assert.equal(think.isFunction(think.getModuleConfig), true);
  })
  it('think.getModuleConfig get sys config', function(){
    var _moduleConfig = thinkData.config;
    thinkCache(thinkCache.MODULE_CONFIG, {})
    var configs = think.getModuleConfig(true);
    //assert.deepEqual(Object.keys(configs).sort(), [ 'action_suffix', 'cache', 'call_controller', 'callback_name', 'cluster_on', 'cookie', 'create_server', 'csrf', 'db', 'default_action', 'default_controller', 'default_module', 'deny_module_list', 'encoding', 'error', 'gc', 'hook_on', 'host', 'html_cache', 'json_content_type', 'locale', 'log_pid', 'log_request', 'memcache', 'output_content', 'package', 'pathname_prefix', 'pathname_suffix', 'port', 'post', 'proxy_on', 'redis', 'resource_on', 'resource_reg', 'route_on', 'session', 'subdomain', 'timeout', 'tpl', 'validate', 'websocket' ]);
    assert.equal(think.isObject(configs), true);
    thinkData.config = _moduleConfig;
  })
  it('think.getModuleConfig get sys config 2', function(){
    var _moduleConfig = thinkData.config;
    thinkData.config = {};
    var configs = think.getModuleConfig(true);
    var configs2 = think.getModuleConfig(true);
    assert.deepEqual(configs, configs2);
    thinkData.config = _moduleConfig;
  })
  it('think.getModuleConfig get sys config, with cli', function(){
    var _moduleConfig = thinkData.config;
    thinkData.config = {};
    var cli = think.cli;
    think.cli = 'test';
    var configs = think.getModuleConfig(true);
    assert.equal(think.isObject(configs), true);
    assert.equal(configs.auto_reload, false);
   thinkData.config = _moduleConfig;
    think.cli = cli;
  })
  it('think.getModuleConfig get common config', function(){
    var _moduleConfig = thinkData.config;
    thinkData.config = {};
    var configs = think.getModuleConfig();
    assert.equal(think.isObject(configs), true);
    assert.equal(configs.auto_reload, false);
    thinkData.config = _moduleConfig;
  })

  it('think.getModuleConfig get common config 2', function(done){
    var _moduleConfig = thinkData.config;
    thinkData.config = {};
    var appPath = think.APP_PATH + '/config/';
    think.mkdir(appPath);

    var fs = require('fs');
    fs.writeFileSync(appPath + '/config.js', 'module.exports = {welefen: "suredy"}');
    think.mode = think.mode_normal;
    var configs = think.getModuleConfig();
    assert.equal(configs.welefen, 'suredy');
    thinkData.config = _moduleConfig;
    think.rmdir(think.APP_PATH).then(done);
  })
  it('think.getModuleConfig get common config 3', function(done){
    var _moduleConfig = thinkData.config;
    thinkData.config = {};
    var appPath = think.APP_PATH + '/config/';
    think.mkdir(appPath);

    var fs = require('fs');
    fs.writeFileSync(appPath + '/aaa.js', 'module.exports = {welefen: "suredy"}');
    think.mode = think.mode_normal;
    var configs = think.getModuleConfig();
    assert.deepEqual(configs.aaa, {welefen: 'suredy'});
    thinkData.config = _moduleConfig;
    think.rmdir(think.APP_PATH).then(done);
  })
  it('think.getModuleConfig get common config 4', function(done){
    var _moduleConfig = thinkData.config;
    thinkData.config = {};
    var appPath = think.APP_PATH + '/config/';
    think.mkdir(appPath);

    var fs = require('fs');
    fs.writeFileSync(appPath + '/_aaa.js', 'module.exports = {welefen: "suredy"}');
    think.mode = think.mode_normal;
    var configs = think.getModuleConfig();
    assert.deepEqual(configs.aaa, undefined);
    thinkData.config = _moduleConfig;
    think.rmdir(think.APP_PATH).then(done);
  })
  it('think.getModuleConfig get common config 5', function(done){
    var _moduleConfig = thinkData.config;
    thinkData.config = {};
    var appPath = think.APP_PATH + '/config/locale';
    think.mkdir(appPath);

    var fs = require('fs');
    fs.writeFileSync(appPath + '/en.js', 'module.exports = {welefen: "suredy"}');
    think.mode = think.mode_normal;
    var configs = think.getModuleConfig();
    assert.deepEqual(configs.locale.en.welefen, 'suredy');
    thinkData.config = _moduleConfig;
    think.rmdir(think.APP_PATH).then(done);
  })

  it('think.hook get all hook', function(){
    var data = Object.keys(thinkData.hook).sort();
    assert.deepEqual(data, ["controller_after","controller_before","logic_after","logic_before","payload_parse","payload_validate","request_begin","resource","response_end","route_parse","view_after","view_before","view_filter", "view_parse","view_template"])
  })
  it('think.hook get item hook', function(){
    var data = think.hook('route_parse');
    assert.deepEqual(data, ['rewrite_pathname', 'parse_route'])
  })
  it('think.hook get item hook, not exist', function(){
    var data = think.hook('route_parse111');
    assert.deepEqual(data, [])
  })
  it('think.hook set hook data, array', function(){
    think.hook('test', ['welefen']);
    assert.deepEqual(think.hook('test'), ['welefen']);
    delete thinkData.hook.test;
  })
  it('think.hook set hook data, array 1', function(){
    thinkData.hook.test = ['suredy']
    think.hook('test', ['welefen']);
    assert.deepEqual(think.hook('test'), ['welefen']);
    delete thinkData.hook.test;
  })
  it('think.hook set hook data, append', function(){
    thinkData.hook.test = ['suredy']
    think.hook('test', ['welefen'], 'append');
    assert.deepEqual(think.hook('test'), ['suredy', 'welefen']);
    delete thinkData.hook.test;
  })
  it('think.hook set hook data, append 1', function(){
    thinkData.hook.test = ['suredy']
    think.hook('test', ['append', 'welefen']);
    assert.deepEqual(think.hook('test'), ['suredy', 'welefen']);
    delete thinkData.hook.test;
  })
  it('think.hook set hook data, prepend', function(){
    thinkData.hook.test = ['suredy']
    think.hook('test', ['welefen'], 'prepend');
    assert.deepEqual(think.hook('test'), ['welefen', 'suredy']);
    delete thinkData.hook.test;
  })
  it('think.hook set hook data, prepend 1', function(){
    thinkData.hook.test = ['suredy']
    think.hook('test', ['prepend', 'welefen']);
    assert.deepEqual(think.hook('test'), ['welefen', 'suredy']);
    delete thinkData.hook.test;
  })
  it('think.hook remove hook data', function(){
    thinkData.hook.test = ['suredy']
    think.hook('test', null);
    assert.deepEqual(think.hook('test'), []);
    delete thinkData.hook.test;
  })
  it('think.hook add hook, append', function(){
    think.hook('__test', 'welefen');
    assert.deepEqual(think.hook('__test'), ['welefen']);
    delete thinkData.hook.__test;
  })
  it('think.hook add hook, function', function(){
    var fn = function(){};
    think.hook('__test', fn);
    var data = think.hook('__test');
    assert.equal(data[0].length, 43);
    var fn1 = think.middleware(data[0]);
    assert.equal(fn, fn1);
    delete thinkData.hook.__test;
  })
  it('think.hook exec hook, emtpy', function(done){
    getHttp().then(function(http){
      think.hook('__not_exist', http, '__not_exist').then(function(data){
        assert.equal(data, '__not_exist');
        done();
      })
    })
  })

  it('think.hook exec hook', function(done){
    think.hook('__test__', function(http, data){
      return data;
    })
    getHttp().then(function(http){
      think.hook('__test__', http, '__test__').then(function(data){
        assert.equal(data, '__test__');
        delete thinkData.hook.__test__;
        
        done();
      })
    })
  })

  it('think.hook exec hook, no return', function(done){
    think.hook('__test__', function(http, data){
      return 'test';
    })
    think.hook('__test__', function(http, data){
      return;
    }, 'append')
    getHttp().then(function(http){
      think.hook('__test__', http, '__test__').then(function(data){
        assert.equal(data, 'test');
        delete thinkData.hook.__test__;
        done();
      })
    })
  })
  it('think.hook exec hook, no return', function(done){
    thinkData.hook.haha = [function(){
      return 1;
    }, function(){
      return 2;
    }]
    getHttp().then(function(http){
      think.hook('haha', http, 'haha').then(function(data){
        assert.equal(data, 2);
        delete thinkData.hook.haha;
        done();
      })
    })
  })
  it('think.hook exec hook, hook empty 2', function(done){
    thinkData.hook.haha = [function(){
      return 1;
    }, function(){
      return 2;
    }]
    getHttp().then(function(http){
      think.hook('haha2', http, 'haha').then(function(data){
        assert.equal(data, 'haha');
        delete thinkData.hook.haha;
        done();
      })
    })
  })
  it('think.hook exec hook, return null', function(done){
    thinkData.hook.haha = [function(){
      return 1;
    }, function(){
      return null;
    }, function(){
      return 3;
    }]
    getHttp().then(function(http){
      think.hook('haha', http, 'haha').then(function(data){
        assert.equal(data, 1);
        delete thinkData.hook.haha;
        done();
      })
    })
  })
  it('think.hook exec hook, return undefined', function(done){
    thinkData.hook.haha = [function(){
      return 1;
    }, function(){
      return 2;
    }, function(){
      return undefined;
    }]
    getHttp().then(function(http){
      think.hook('haha', http, 'haha').then(function(data){
        assert.equal(data, 2);
        delete thinkData.hook.haha;
        done();
      })
    })
  })


  it('think.hook exec hook, class', function(done){
    var cls = think.Class({
      init: function(){

      },
      run: function(){
        return 'run';
      }
    }, true)
    think.hook('__test__', cls);
    getHttp().then(function(http){
      think.hook('__test__', http, '__test__').then(function(data){
        assert.equal(data, 'run');
        delete thinkData.hook.__test__;
        done();
      })
    })
  })

  it('think.middleware register middleware, function', function(){
    var fn = function(){}
    var data = think.middleware('___test', fn);
    assert.equal(thinkData.middleware.___test, fn);
    assert.equal(data, undefined);
    delete thinkData.middleware.___test;
  })
  it('think.middleware register middleware, class', function(){
    var fn = think.Class({
      run: function(){}
    }, true)
    var data = think.middleware('___test', fn)
    assert.equal(thinkData.middleware.___test, fn);
    assert.equal(data, undefined);
    delete thinkData.middleware.___test
  })
  it('think.middleware exec middleware, no data', function(done){
    think.middleware('___test', function(){
      return 'http';
    })
    getHttp().then(function(http){
      think.middleware('___test', http).then(function(data){
        assert.equal(data, 'http');
        delete thinkData.middleware.___test;
        done();
      })
    })
  })
  it('think.middleware exec middleware, with data', function(done){
    think.middleware('___test', function(http, data){
      return data;
    })
    getHttp().then(function(http){
      think.middleware('___test', http, '___http').then(function(data){
        assert.equal(data, '___http');
        delete thinkData.middleware.___test;
        done();
      })
    })
  })
  it('think.middleware exec middleware, not exist', function(done){
    getHttp().then(function(http){
      return think.middleware('___testxxx', http, '___http').catch(function(err){
        assert.equal(err.stack.indexOf('`___testxxx`') > -1, true);
        delete thinkData.middleware.___test;
        done();
      })
    })
  })
  it('think.middleware exec middleware, function', function(done){
    getHttp().then(function(http){
      return think.middleware(function(http, data){
        return data;
      }, http, '___http').then(function(data){
        assert.equal(data, '___http');
        done();
      })
    })
  })
  it('think.middleware get middleware', function(){
    var fn = function(){};
    think.middleware('fasdfasf', fn);
    var fn1 = think.middleware("fasdfasf");
    assert.equal(fn1, fn);
    delete thinkData.middleware.fasdfasf;
  })
  it('think.middleware get sys middleware', function(){
    var fn1 = think.middleware("parse_route");
    assert.equal(think.isFunction(fn1), true);
  })
  it('think.middleware get sys middleware, not found', function(){
    try{
      var fn1 = think.middleware("deny_ip11");
    }catch(err){
      assert.equal(err.stack.indexOf('`deny_ip11`') > -1, true);
    }
  })
  it('think.middleware create middleware', function(){
    var cls = think.middleware({
      getTest: function(){
        return 'getTest';
      }
    })
    assert.equal(think.isFunction(cls.prototype.getTest), true);
    var instance = new cls({});
    assert.equal(instance.getTest(), 'getTest');
  })
  it('think.middleware create middleware, superClass', function(){
    var superClass = think.middleware({
      getTest: function(){
        return 'getTest';
      }
    })
    var childClass = think.middleware(superClass, {
      getTest2: function(){
        return 'getTest2';
      }
    })
    assert.equal(think.isFunction(childClass.prototype.getTest), true);
    var instance = new childClass({});
    assert.equal(instance.getTest(), 'getTest');
    assert.equal(instance.getTest2(), 'getTest2');
  })

  it('think.uuid is function', function(){
    assert.equal(think.isFunction(think.uuid), true)
  })
  it('think.uuid default length is 32', function(){
    var data = think.uuid();
    assert.equal(data.length, 32);
  })
  it('think.uuid change length to 40', function(){
    var data = think.uuid(40);
    assert.equal(data.length, 40);
  })
  it('think.adapter add adapter', function(){
    var fn = function(){}
    var key = 'adapter_welefen_suredy';
    think.adapter('welefen', 'suredy', fn);
    var fn1 = thinkData.export[key];
    assert.equal(fn, fn1);
    delete thinkData.export[key];
  })
  it('think.adapter create adapter', function(){
    var fn = think.adapter('session', 'memory', {
      getTest1: function(){
        return '___getTest';
      }
    });
    assert.equal(think.isFunction(fn.prototype.getTest1), true);
    var instance = new fn();
    var data = instance.getTest1();
    assert.equal(data, '___getTest');
  })
  it('think.adapter get adapter', function(){
    var fn = think.adapter('session', 'memory');
    assert.equal(think.isFunction(fn), true);
    assert.equal(think.isFunction(fn.prototype.get), true);
  })
  it('think.adapter get adapter, not found', function(){
    try{
      var fn = think.adapter('session', 'welefen111');
    }catch(err){
      assert.equal(err.stack.indexOf('`adapter_session_welefen111`') > -1, true);
    }
  })
  it('think.adapter create adapter 2, parent is not exist', function(done){
    try{
      var fn = think.adapter('session', {
        getTest1: function(){
          return '___getTest';
        }
      })
    }catch(e){
      done();
    }
  })
  it('think.adapter create adapter', function(){
    var fn = think.adapter({});
    assert.equal(think.isFunction(fn), true);
    var instance = new fn();
    assert.equal(think.isFunction(instance.invoke), true);
  })
  it('think.adapter create adapter, super', function(){
    var cls = think.Class({
      getName: function(){
        return 'super';
      }
    }, true)
    var fn = think.adapter(cls, {});
    assert.equal(think.isFunction(fn), true);
    assert.equal(think.isFunction(fn.prototype.getName), true);
  })
  it('think.adapter create adapter, super 2', function(){
    var fn = think.adapter('adapter_session_memory', {});
    assert.equal(think.isFunction(fn), true);
    assert.equal(think.isFunction(fn.prototype.get), true);
  })
  it('think.adapter create adapter, super 3', function(){
    var fn = think.adapter('store', 'memory');
    assert.equal(think.isFunction(fn), true);
    assert.equal(think.isFunction(fn.prototype.get), true);
  })

  it('think.adapter.load base', function(done){
    var mode = think.mode;
    var path = think.getPath(undefined, think.dirname.adapter);;
    think.mkdir(path);
    think.adapter.load(true);
    think.rmdir(path).then(done);
  })
  it('think.adapter.load load, store/base adapter', function(done){
    var mode = think.mode;
    var path = think.getPath(undefined, think.dirname.adapter);;
    think.mkdir(path);
    think.adapter.load('store', 'memory');
    think.rmdir(path).then(done);
  })
  it('think.adapter.load extra adapter', function(done){
    var mode = think.mode;
    var path = think.getPath(undefined, think.dirname.adapter);;
    think.mkdir(path + '/welefentest');
    require('fs').writeFileSync(path + '/welefentest/base.js', 'module.exports=think.Class({}, true)')
    think.adapter.load();
    assert.equal(think.isFunction(think.adapter.welefentest), false);
    delete think.adapter.welefentest;
    think.rmdir(path).then(done);
  })

  it('think.alias get alias', function(){
    var data = think.alias();
    assert.equal(think.isString(data.validator), true);
  })

  it('think.route clear route', function(){
    var routes = thinkData.route;
    think.route(null);
    assert.equal(thinkData.route, null);
    thinkData.route = routes;
  })
  it('think.route set routes, array', function(){
    var routes = thinkData.route;
    think.route(['welefen']);
    assert.deepEqual(thinkData.route, ['welefen']);
    thinkData.route = routes;
  })
  it('think.route get routes, exist', function(){
    var routes = thinkData.route;
    think.route(['welefen']);
    assert.deepEqual(think.route(), ['welefen']);
    thinkData.route = routes;
  })
  it('think.route route config exports is function', function(done){
    think.mode = think.mode_normal;
    var routes = thinkData.route;
    think.route(null);

    var filepath = think.getPath(undefined, think.dirname.config) + think.sep + 'route.js';;
    delete require.cache[filepath];

    
    think.mkdir(path.dirname(filepath));
    require('fs').writeFileSync(filepath, 'module.exports=function(){return ["welefen", "suredy"]}');

    Promise.resolve(think.route()).then(function(data){
      assert.deepEqual(data, ['welefen', 'suredy']);
      thinkData.route = routes;
      think.rmdir(think.APP_PATH).then(done);
    }).catch(function(err){
      console.log(err.stack)
    });
  })
  it('think.route route config exports is function 2', function(done){
    think.mode = think.mode_normal;
    var routes = thinkData.route;
    think.route(null);

    var filepath = think.getPath(undefined, think.dirname.config) + think.sep + 'route.js';;

    delete require.cache[filepath];

    think.mkdir(path.dirname(filepath));
    require('fs').writeFileSync(filepath, 'module.exports=function(){return ["welefen", "suredy", "1111"]}');

    think.route().then(function(data){
      assert.deepEqual(data, ['welefen', 'suredy', '1111']);
      thinkData.route = routes;
      think.rmdir(think.APP_PATH).then(done);
    });
  })
  it('think.route route config exports is function, no return', function(done){
    think.mode = think.mode_normal;
    var routes = thinkData.route;
    think.route(null);

    var filepath = think.getPath(undefined, think.dirname.config) + think.sep + 'route.js';;

    delete require.cache[filepath];

    think.mkdir(path.dirname(filepath));
    require('fs').writeFileSync(filepath, 'module.exports=function(){return;}');

    think.route().then(function(data){
      assert.deepEqual(data, []);
      thinkData.route = routes;
      think.rmdir(think.APP_PATH).then(done);
    });
  })
  it('think.route route config exports object', function(done){
    think.mode = think.mode_normal;
    var routes = thinkData.route;
    think.route(null);

    var filepath = think.getPath(undefined, think.dirname.config) + think.sep + 'route.js';;

    delete require.cache[filepath];

    think.mkdir(path.dirname(filepath));
    require('fs').writeFileSync(filepath, 'module.exports={admin: {reg: /^admin/, children: []}}');

    Promise.resolve(think.route()).then(function(data){
      assert.deepEqual(data, {admin: {reg: /^admin/, children: []}});
      thinkData.route = routes;
      think.rmdir(think.APP_PATH).then(done);
    });
  })
  it('think.route common route is object, load module route', function(done){
    think.mode = think.mode_module;
    var routes = thinkData.route;
    think.route(null);

    var filepath = think.getPath(undefined, think.dirname.config) + think.sep + 'route.js';
    var adminpath = think.getPath('admin', think.dirname.config) + think.sep + 'route.js';
    delete require.cache[filepath];
    delete require.cache[adminpath];

    think.mkdir(path.dirname(filepath));
    think.mkdir(path.dirname(adminpath));
    require('fs').writeFileSync(filepath, 'module.exports={admin: {reg: /^admin/, children: []}}');
    require('fs').writeFileSync(adminpath, 'module.exports=[[/^admin\\/index/, "admin/index/list"]]');

    Promise.resolve(think.route()).then(function(data){
      assert.deepEqual(data, {admin: {reg: /^admin/, children: [[/^admin\/index/, "admin/index/list"]]}});
      thinkData.route = routes;
      think.rmdir(think.APP_PATH).then(done);
    });
  })
  it('think.route common route is object, load module route, module route not exist', function(done){
    think.mode = think.mode_module;
    var routes = thinkData.route;
    think.route(null);

    var filepath = think.getPath(undefined, think.dirname.config) + think.sep + 'route.js';
    delete require.cache[filepath];

    think.mkdir(path.dirname(filepath));
    require('fs').writeFileSync(filepath, 'module.exports={test: {reg: /^admin/}}');

    Promise.resolve(think.route()).then(function(data){
      assert.deepEqual(data, {test: {reg: /^admin/, children: []}});
      thinkData.route = routes;
      think.rmdir(think.APP_PATH).then(done);
    });
  })

  it('think.gc gc off', function(){
    var on = think.config('gc.on');
    think.config('gc.on', false);
    var Cls = think.Class({gcType: 'test'}, true);
    var data = think.gc(new Cls);
    assert.equal(data, undefined);
    think.config('gc.on', on);
  })
  it('think.gc timers', function(done){
    think.config('gc.on', true);
    var interval = global.setInterval;
    global.setInterval = function(fn, inter){
      assert.equal(inter, 3600000);
      assert.equal(think.isFunction(fn), true);
      fn();
      global.setInterval = interval;
      done();
    }
    var Cls = think.Class({gcType: 'test', gc: function(){}}, true);
    var data = think.gc(new Cls);
  })
  it('think.gc timers, filter', function(done){
    think.config('gc.on', true);
    var filter = think.config('gc.filter');
    think.config('gc.filter', function(){
      return true;
    })
    var interval = global.setInterval;
    global.setInterval = function(fn, inter){
      assert.equal(inter, 3600000);
      assert.equal(think.isFunction(fn), true);
      var data = fn();
      assert.equal(data, 'gc');
      think.config('gc.filter', filter);
      global.setInterval = interval;
      done();
    }
    var Cls = think.Class({gcType: 'test', gc: function(){
      return 'gc';
    }}, true);
    var data = think.gc(new Cls);
  })

  it('think._http json stringify, with url', function(){
    var data = {url: "/welefen/suredy"};
    var result = think._http(JSON.stringify(data));
    assert.equal(result.req.url, "/welefen/suredy");
    assert.equal(result.req.method, 'GET');
    assert.equal(result.req.httpVersion, '1.1')
  })
  it('think._http json stringify, without url', function(){
    var data = {method: "post"};
    var result = think._http(JSON.stringify(data));
    assert.equal(result.req.url, "/");
    assert.equal(result.req.method, 'POST');
    assert.equal(result.req.httpVersion, '1.1')
  })
  it('think._http json stringify, url.parse', function(){
    var data = 'url=/welefen/suredy&method=delete';
    var result = think._http(data);
    assert.equal(result.req.url, "/welefen/suredy");
    assert.equal(result.req.method, 'DELETE');
    assert.equal(result.req.httpVersion, '1.1')
  })
  it('think._http data is string', function(){
    var data = '/welefen/suredy';
    var result = think._http(data);
    assert.equal(result.req.url, "/welefen/suredy");
    assert.equal(result.req.method, 'GET');
    assert.equal(result.req.httpVersion, '1.1')
  })
  it('think._http data is obj', function(){
    var data = {url: '/welefen/suredy'};
    var result = think._http(data);
    assert.equal(result.req.url, "/welefen/suredy");
    assert.equal(result.req.method, 'GET');
    assert.equal(result.req.httpVersion, '1.1')
  })
  it('think._http data empty', function(){
    var result = think._http();
    assert.equal(result.req.url, "/");
    assert.equal(result.req.method, 'GET');
    assert.equal(result.req.httpVersion, '1.1')
  })
  it('think._http end is function', function(){
    var result = think._http();
    assert.equal(think.isFunction(result.res.end), true);
    assert.equal(result.res.end(), undefined)
  })

  it('think.http get monitor http', function(done){
    think.http('/welefen/suredy').then(function(http){
      assert.equal(http.url, '/welefen/suredy');
      done();
    })
  })
  it('think.http get unsafe url', function(done){
    think.http('/../../../../../etc/passwd').then(function(http){
      assert.equal(http.pathname, 'etc/passwd');
      assert.equal(http.url, '/../../../../../etc/passwd');
      done();
    })
  })
  it('think.http get unsafe url 1', function(done){
    think.http('../../../../../etc/passwd').then(function(http){
      assert.equal(http.pathname, 'etc/passwd');
      assert.equal(http.url, '/../../../../../etc/passwd');
      done();
    })
  })
  it('think.http get unsafe url 2', function(done){
    think.http('/resource/../../../../../../etc/passwd').then(function(http){
      assert.equal(http.pathname, 'resource/etc/passwd');
      assert.equal(http.url, '/resource/../../../../../../etc/passwd');
      done();
    })
  })

  it('think.locale base', function(){
    var msg = think.locale('CONTROLLER_NOT_FOUND', 'welefen');
    assert.equal(msg.indexOf('`welefen`') > -1, true)
  })
  it('think.locale key not found', function(){
    var msg = think.locale('KEY_NOT_FOUND');
    assert.equal(msg, 'KEY_NOT_FOUND')
  })
  it('think.locale lang is empty', function(){
    var lang = think.lang;
    think.lang = '';
    var msg = think.locale('CONTROLLER_NOT_FOUND', 'welefen');
    assert.equal(msg.indexOf('`welefen`') > -1, true);
    think.lang = lang;
  })

  it('think.npm package is exist', function(done){
    think.npm('multiparty').then(function(data){
      assert.equal(think.isFunction(data.Form), true);
      done();
    })
  })
  it('think.npm install package redis', function(done){
    var log = think.log;
    think.log = function(){};
    var exec = require('child_process').exec;
    var trequire = think.require;
    var flag = false;
    think.require = function(){
      if(flag){
        return {
          Client: function(){}
        };
      }
      throw new Error('require error')
    }
    require('child_process').exec = function(cmd, options, callback){
      assert.equal(cmd, 'npm install package-not-exist --save');
      flag = true;
      callback && callback();
    }

    think.npm('package-not-exist').then(function(data){
      require('child_process').exec = exec;
      think.require = trequire;
      think.log = log;

      assert.equal(think.isFunction(data.Client), true);
      done();
    })
  })
  it('think.npm install package redis@2.3.0', function(done){
    var log = think.log;
    think.log = function(){};
    var exec = require('child_process').exec;
    var trequire = think.require;
    var flag = false;
    think.require = function(){
      if(flag){
        return {
          RedisClient: function(){}
        };
      }
      throw new Error('require error 1')
    }
    require('child_process').exec = function(cmd, options, callback){
      assert.equal(cmd, 'npm install redis@2.3.0 --save');
      flag = true;
      callback && callback();
    }

    think.rmdir(think.THINK_PATH + '/node_modules/redis').then(function(){
      return think.npm('redis@2.3.0');
    }).then(function(data){
      require('child_process').exec = exec;
      think.require = trequire;
      think.log = log;

      assert.equal(think.isFunction(data.RedisClient), true);
      done();
    })
    
  })
  it('think.npm install package redis 2', function(done){
    var log = think.log;
    think.log = function(){};
    var exec = require('child_process').exec;
    var trequire = think.require;
    var flag = false;
    think.require = function(){
      if(flag){
        return {
          RedisClient: function(){}
        };
      }
      throw new Error('require error 2')
    }
    require('child_process').exec = function(cmd, options, callback){
      //console.log(cmd)
      assert.equal(cmd, 'npm install redis@2.3.0 --save');
      flag = true;
      callback && callback();
    }

    think.rmdir(think.THINK_PATH + '/node_modules/redis').then(function(){
      return think.npm('redis');
    }).then(function(data){
      require('child_process').exec = exec;
      think.require = trequire;
      think.log = log;

      assert.equal(think.isFunction(data.RedisClient), true);
      done();
    })
  })
  it('think.npm install package not exist', function(done){
    var log = think.log;
    think.log = function(){};
    var exec = require('child_process').exec;
    var trequire = think.require;
    var flag = false;
    think.require = function(){
      if(flag){
        return {
          RedisClient: function(){}
        };
      }
      throw new Error('require error 3')
    }
    var wait = think.await;
    think.await = function(str, callback){
      return callback && callback();
    }
    require('child_process').exec = function(cmd, options, callback){
      assert.equal(cmd, 'npm install package_not_exist --save');
      flag = true;
      callback && callback(new Error('package not exist'));
    }
    return think.npm('package_not_exist').catch(function(err){
      require('child_process').exec = exec;
      think.require = trequire;
      think.log = log;
      think.await = wait;

      assert.equal(err.message, 'package not exist');
      done();
    })
  })

  it('think.validate get validate', function(){
    var email = think.validate('email');
    assert.equal(think.isFunction(email), true);
    assert.equal(email('welefen@gmail.com'), true);
  })
  it('think.validate register validate', function(){
    think.validate('welefen', function(value){
      return value === 'welefen';
    })
    var welefen = think.validate('welefen');
    assert.equal(welefen('welefen'), true);
  })
  it('think.validate validate', function(){
    var data = {
      welefen: {
        value: 'welefen',
        email: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen'])
  })
  it('think.validate validate array, validate not set', function(){
    var data = {
      welefen: {
        value: 'welefen'
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(msg, {})
  })
  it('think.validate validate object', function(){
    var data = {
      welefen: {
        value: 'welefen@gmail.com',
        required: true,
        email: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(msg, {})
  })
  it('think.validate validate with default value', function(){
    var data = {
      welefen: {
        value: '',
        default: 'welefen@thinkjs.org',
        required: true,
        email: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(msg, {})
  })
  it('think.validate validate with default function', function(){
    var data = {
      welefen: {
        value: '',
        default: function(){return 'welefen@thinkjs.org'},
        required: true,
        email: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(msg, {})
  })
  it('think.validate validate with default function, other value', function(){
    var data = {
      welefen: {
        value: '',
        default: function(){return this.test},
        required: true,
        email: true
      },
      test: {
        value: 'welefen@thinkjs.org'
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(msg, {})
  })
  it('think.validate validate object, required', function(){
    var data = {
      welefen: {
        value: '',
        required: true,
        email: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen'])
  })
  it('think.validate validate object, not required', function(){
    var data = {
      welefen: {
        value: '',
        email: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(msg, {})
  })
  it('think.validate with args, int', function(){
    var data = {
      welefen: {
        value: 10,
        int: true,
        min: 10, 
        max: 100
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(msg, {})
  })
  it('think.validate with args, int', function(){
    var data = {
      welefen: {
        value: 10,
        int: true,
        min: 30, 
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen'])
  })
  it('think.validate with args, equal, fail', function(){
    var data = {
      welefen: {
        value: 10
      },
      suredy: {
        value: 5,
        equals: 'welefen'
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['suredy'])
  })
  it('think.validate with args, equal', function(){
    var data = {
      welefen: {
        value: 'pwd'
      },
      suredy: {
        value: 'pwd',
        equals: 'welefen'
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), [])
  })
  it('think.validate int, 10, 100', function(){
    var data = {
      welefen: {
        value: 40,
        int: [10, 100]
      },
      suredy: {
        value: 'pwd',
        equals: 'welefen'
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['suredy'])
  })
  it('think.validate int, 10, 100, with msg', function(){
    var data = {
      welefen: {
        value: 400,
        int: [10, 100]
      },
    }
    var msg = think.validate(data, {
      validate_int_welefen: 'not valid'
    });
    assert.deepEqual(msg, {welefen: 'not valid'})
  })
  it('think.validate int, 10, 100, with msg 2', function(){
    var data = {
      welefen: {
        value: 400,
        int: [10, 100]
      },
      suredy: {
        value: 900,
        int: [10, 100]
      }
    }
    var msg = think.validate(data, {
      validate_int_welefen: 'not valid',
      validate_int: 'int fail'
    });
    assert.deepEqual(msg, {welefen: 'not valid', suredy: 'int fail'})
  })
  it('think.validate not function', function(){
    var data = {
      welefen: {
        value: 'fasdf',
        required: true,
        not_exist111: true
      }
    }
    try{
      var msg = think.validate(data);
      assert.equal(1, 2);
    }catch(err){
      assert.equal(err.message !== '1 == 2', true)
    } 
  })
  it('think.validate register function, validate', function(){
    think.validate('welefen11', function(){
      return false;
    })
    var data = {
      welefen: {
        value: 'welefen',
        welefen11: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value is empty, required|int', function(){
    var data = {
      welefen: {
        value: '',
        int: true,
        required: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value is empty, int NaN', function(){
    var data = {
      welefen: {
        value: NaN,
        int: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate value is empty, int 0', function(){
    var data = {
      welefen: {
        value: 0,
        int: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate value, regexp', function(){
    var data = {
      welefen: {
        value: 'test',
        regexp: /\d+/
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value, regexp true', function(){
    var data = {
      welefen: {
        value: 'testww222',
        regexp: /\d+/
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate value is empty, required|int NaN', function(){
    var data = {
      welefen: {
        value: NaN,
        int: true,
        required: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value not number, required|int', function(){
    var data = {
      welefen: {
        value: 'aaaa',
        int: true,
        required: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value number string, required|int', function(){
    var data = {
      welefen: {
        value: '11111',
        int: true,
        required: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate value float string, required|int', function(){
    var data = {
      welefen: {
        value: '111.11',
        int: true,
        required: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value is array', function(){
    var data = {
      welefen: {
        value: [10, 20],
        int: true,
        array: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate value empty, required|array', function(){
    var data = {
      welefen: {
        value: '',
        required: true,
        array: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value empty, required|array', function(){
    var data = {
      welefen: {
        value: 'welefen',
        required: true,
        array: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate value empty, required|object', function(){
    var data = {
      welefen: {
        value: JSON.stringify({name: 'thinkjs'}),
        required: true,
        object: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate value empty, required|object', function(){
    var data = {
      welefen: {
        value: 'not json',
        required: true,
        object: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value is array, not valid', function(){
    var data = {
      welefen: {
        value: [10, 'ww'],
        int: true,
        array: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), ['welefen']);
  })
  it('think.validate value not a array', function(){
    var data = {
      welefen: {
        value: 10,
        int: true,
        array: true
      }
    }
    var msg = think.validate(data);
    assert.deepEqual(Object.keys(msg), []);
  })
  it('think.validate.values', function(){
    var data = {
      welefen: {
        value: '',
        int: true,
        default: '10'
      }
    }
    var msg = think.validate.values(data);
    assert.deepEqual(msg, {welefen: '10'});
  })
  it('think.validate.values default is function', function(){
    var data = {
      welefen: {
        value: '',
        int: true,
        default: function(){return '10'}
      }
    }
    var msg = think.validate.values(data);
    assert.deepEqual(msg, {welefen: '10'});
  })
  it('think.validate.values default is function, with other field', function(){
    var data = {
      welefen: {
        value: '',
        default: function(){return this.test}
      },
      test: {
        value: 'test'
      }
    }
    var msg = think.validate.values(data);
    assert.deepEqual(msg, {welefen: 'test', test: 'test'});
  })
  it('think.validate.values default is function, with other field 1', function(){
    var data = {
      welefen: {
        value: '',
        default: function(){return this.test}
      },
      test: {
        value: 'test'
      },
      haha: {
        value: '1',
        boolean: true
      }
    }
    var msg = think.validate.values(data);
    assert.deepEqual(msg, {welefen: 'test', test: 'test',haha: true});
  })
  it('think.validate.values default is function, with other field 2', function(){
    var data = {
      welefen: {
        value: '',
        default: function(){return this.test}
      },
      test: {
        value: 'test'
      },
      haha: {
        value: 'no',
        boolean: true
      }
    }
    var msg = think.validate.values(data);
    assert.deepEqual(msg, {welefen: 'test', test: 'test',haha: false});
  })


  it('think.cache get cache not exist', function(done){
    think.config('gc.on', false);
    think.cache('not_exist_xx').then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('think.cache get cache exist', function(done){
    think.config('gc.on', false);
    think.cache('fadfasdfasd', 'welefen').then(function(){
      return think.cache('fadfasdfasd');
    }).then(function(data){
      assert.equal(data, 'welefen');
      return think.cache('fadfasdfasd', null)
    }).then(function(){
      done();
    })
  })
  it('think.cache waiting for function', function(done){
    think.config('gc.on', false);
    think.cache('faswwwwwdddf', function(){
      return 'data__'
    }).then(function(data){
      assert.equal(data, 'data__');
    }).then(function(){
      return think.cache('faswwwwwdddf')
    }).then(function(data){
      assert.equal(data, 'data__');
      return think.cache('faswwwwwdddf', null);
    }).then(function(){
      return think.cache('faswwwwwdddf')
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('think.cache waiting for function, exist', function(done){
    think.config('gc.on', false);
    think.cache('welefen++++', 'welefen').then(function(){
      return think.cache('welefen++++', function(){
        assert.equal(1, 2)
        return 'suredy';
      }).then(function(data){
        assert.equal(data, 'welefen');
        return think.cache('welefen++++', null)
      }).then(function(){
        done();
      })
    })
  })
  it('think.cache waiting for function, exist 1', function(done){
    think.config('gc.on', false);
    think.cache('welefen++++1', 'welefen', {}).then(function(){
      return think.cache('welefen++++1', function(){
        assert.equal(1, 2)
        return 'suredy';
      }).then(function(data){
        assert.equal(data, 'welefen');
        return think.cache('welefen++++1', null)
      }).then(function(){
        done();
      })
    })
  })
  it('think.cache waiting for function, change cache type', function(done){
    think.config('gc.on', false);
    var adapter = think.adapter;
    muk(think, 'adapter', function(atype, type){
      assert.equal(type, 'file');
      muk.restore();
      return adapter(atype, 'file');
    })
    think.cache('welefen++++2', 'welefen', {type: 'file'}).then(function(){
      return think.cache('welefen++++2', function(){
        assert.equal(1, 2)
        return 'suredy';
      }).then(function(data){
        assert.equal(data, 'welefen');
        return think.cache('welefen++++2', null)
      }).then(function(){
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })

  it('think.service get sub service', function(){
    var cls = think.service({});
    assert.equal(think.isFunction(cls), true)
  })
  it('think.service get sub service', function(){
    var cls = think.service({
      getName: function(){
        return 'welefen'
      }
    });
    assert.equal(think.isFunction(cls), true);
    var instance = new cls();
    assert.equal(instance.getName(), 'welefen')
  })
  it('think.service get service object', function(){
    thinkData.export['home/service/test'] = {
      welefen: function(){
        return 'welefen'
      }
    };
    var service = think.service('home/service/test', {}, 'common');
    assert.deepEqual(service.welefen(), 'welefen');
    delete thinkData.export['home/service/test'];
  })

  it('think.model get sub model', function(){
    var cls = think.model({});
    assert.equal(think.isFunction(cls), true);;
  })
  it('think.model get sub model', function(){
    var cls = think.model({
      getName: function(){
        return 'welefen'
      }
    });
    assert.equal(think.isFunction(cls), true);
    var instance = new cls();
    assert.equal(instance.getName(), 'welefen')
  })
  it('think.model get sub model', function(){
    var cls = think.model({
      getName: function(){
        return 'welefen'
      }
    }, {});
    assert.equal(think.isFunction(cls), true);
    var instance = new cls();
    assert.equal(instance.getName(), 'welefen')
  })
  it('think.model get model instance', function(){
    var instance = think.model('test', {
      host: '127.0.0.1',
      type: 'mysql'
    })
    assert.equal(instance.tablePrefix, 'think_');
  })
  it('think.model get model instance, mongo', function(){
    var instance = think.model('test', {
      host: '127.0.0.1',
      type: 'mongo'
    })
    assert.equal(instance.tablePrefix, 'think_');
  })

  it('think.controller get sub controller', function(){
    var instance = think.controller({}, {}, 'common');
    assert.equal(think.isFunction(instance), true)
  })
  it('think.controller get sub controller', function(done){
    var cls = think.controller({
      getName: function(){
        return 'welefen'
      }
    });
    getHttp().then(function(http){
      var instance = new cls(http);
      assert.equal(instance.getName(), 'welefen');
      done();
    })
  })
  it('think.controller get controller instance', function(done){
    getHttp().then(function(http){
      var controller = think.controller('test', http);
      assert.deepEqual(think.isFunction(controller.view), true);
      done();
    })
    
  })
  it('think.controller get controller object', function(done){
    thinkData.export['home/controller/test'] = think.controller({
      welefen: function(){
        return 'welefen'
      }
    });
    getHttp().then(function(http){
      var controller = think.controller('home/controller/test', http);
      assert.deepEqual(controller.welefen(), 'welefen');
      delete thinkData.export['home/controller/test'];
      done();
    })
  })

  it('think.logic get sub logic', function(){
    var instance = think.logic({}, {}, 'common');
    assert.equal(think.isFunction(instance), true)
  })
  it('think.logic get sub logic', function(done){
    var cls = think.logic({
      getName: function(){
        return 'welefen'
      }
    });
    getHttp().then(function(http){
      var instance = new cls(http);
      assert.equal(instance.getName(), 'welefen');
      done();
    })
  })
  it('think.logic get logic instance', function(done){
    getHttp().then(function(http){
      var logic = think.logic('test', http);
      assert.deepEqual(think.isFunction(logic.view), true);
      done();
    })
    
  })
  it('think.logic get logic object', function(done){
    thinkData.export['home/logic/test'] = think.logic({
      welefen: function(){
        return 'welefen'
      }
    });
    getHttp().then(function(http){
      var logic = think.logic('home/logic/test', http);
      assert.deepEqual(logic.welefen(), 'welefen');
      delete thinkData.export['home/logic/test'];
      done();
    })
  })

  it('think.session get session, exist', function(done){
    getHttp().then(function(http){
      http._session = 'welefen';
      var session = think.session(http);
      assert.equal(session, 'welefen')
      done();
    })
  })
  it('think.session get session', function(done){
    getHttp().then(function(http){
      var session = think.session(http);
      assert.equal(http._cookie.thinkjs.length, 32);
      done();
    })
  })
  it('think.session get session, options, secret error', function(done){
    getHttp().then(function(http){
      var options = think.config('session');
      think.config('session', {
        name: 'test',
        secret: 'welefen'
      })
      http._cookie.test = 'test';
      var session = think.session(http);
      assert.equal(http._cookie.test.length, 32);
      done();
    })
  })
  it('think.session get session, options, secret success', function(done){
    getHttp().then(function(http){
      var options = think.config('session');
      think.config('session', {
        name: 'test',
        secret: 'welefen'
      })

      http._cookie.test = 'g1kzmNA_xtDQKSBP2Q4M1irhPrECxGiZ.yeZHK5ympKa2jZIqRyvHCYJGPhPXemEtQF0ZU8V1Yhg';
      var session = think.session(http);
      assert.equal(http._cookie.test, 'g1kzmNA_xtDQKSBP2Q4M1irhPrECxGiZ');
      done();
    })
  })
  it('think.session get session, options, debug', function(done){
    getHttp().then(function(http){
      var options = think.config('session');
      think.config('session', {
        name: 'test',
        secret: 'welefen'
      })

      http._cookie.test = 'g1kzmNA_xtDQKSBP2Q4M1irhPrECxGiZ.yeZHK5ympKa2jZIqRyvHCYJGPhPXemEtQF0ZU8V1Yhg';
      var log = think.log;
      think.log = function(){}
      var session = think.session(http);
      assert.equal(http._cookie.test, 'g1kzmNA_xtDQKSBP2Q4M1irhPrECxGiZ');
      think.log = log;
      done();
    })
  })
  it('think.session get session, options, flush', function(done){
    getHttp().then(function(http){
      var options = think.config('session');
      think.config('session', {
        name: 'test',
        secret: 'welefen'
      })
      var value = '111';
      var session = think.session(http);
      session.flush = function(){
        value = '222';
      }
      http._session.flush();
      setTimeout(function(){
        assert.equal(value, '222')
        done();
      }, 10)
    })
  })

  it('think.parseConfig merge empty', function(){
    var config = think.parseConfig();
    assert.deepEqual(config, {})
  })
  it('think.parseConfig merge, has adapter & type', function(){
    var config = think.parseConfig({
      type: 'file',
      adapter: {
        file: {
          name: '111'
        }
      }
    });
    assert.deepEqual(config, {'type': 'file', 'name': '111'})
  })
  it('think.parseConfig merge, has adapter & type 1', function(){
    var config = think.parseConfig({
      type: 'file',
      adapter: {
        file: {
          name: '111'
        }
      }
    }, {
      name: 222
    });
    assert.deepEqual(config, {'type': 'file', 'name': 222})
  });
  it('think.parseConfig merge, parser', function(){
    var config = think.parseConfig({
      type: 'file',
      adapter: {
        file: {
          name: '111'
        }
      },
      parser: function(options){
        return {type: 'parser_type'}
      }
    }, {
      name: 222
    });
    assert.deepEqual(config, {'type': 'parser_type', 'name': 222})
  })
  it('think.parseConfig merge, parser, change this', function(){
    var config = think.parseConfig.call({name: 'this'},{
      type: 'file',
      adapter: {
        file: {
          name: '111'
        }
      },
      parser: function(options, other){
        assert.deepEqual(other, {name: 'this'})
        return {type: 'parser_type'}
      }
    }, {
      name: 222
    });
    assert.deepEqual(config, {'type': 'parser_type', 'name': 222})
  })
  
  it('think.error not error', function(){
    var msg = think.error('welefen');
    assert.equal(think.isError(msg), true);
    assert.equal(msg.message, 'welefen')
  })
  it('think.error error contain', function(){
    var msg = think.error(new Error('EACCES'));
    assert.equal(think.isError(msg), true);
    assert.equal(msg.message, 'Permission denied. http://www.thinkjs.org/doc/error_message.html#eacces')
  })
  it('think.error error contain, addon', function(){
    var msg = think.error(new Error('EACCES'), 'haha');
    assert.equal(think.isError(msg), true);
    assert.equal(msg.message, 'Permission denied, haha. http://www.thinkjs.org/doc/error_message.html#eacces')
  })
  it('think.error error, not contain', function(){
    var msg = think.error(new Error('suredy'));
    assert.equal(think.isError(msg), true);
    assert.equal(msg.message, 'suredy')
  })
  it('think.error error, promise', function(done){
    var promise = Promise.reject(new Error('think.error promise'));
    var reject = think.reject;
    think.reject = function(err){
      assert.equal(err.message, 'think.error promise');
      return Promise.reject(err);
    }
    think.error(promise).catch(function(err){
      assert.equal(err.message, 'think.error promise');
      think.reject = reject;
      done();
    });
  })
  it('think.error error, promise, addon', function(done){
    var promise = Promise.reject(new Error('think.error promise, EADDRNOTAVAIL'));
    muk(think, 'reject', function(err){
      assert.equal(err.message, 'Address not available, addon error. http://www.thinkjs.org/doc/error_message.html#eaddrnotavail');
      return Promise.reject(err);
    })
    think.error(promise, new Error('addon error')).catch(function(err){
      assert.equal(err.message, 'Address not available, addon error. http://www.thinkjs.org/doc/error_message.html#eaddrnotavail');
      muk.restore();
      done();
    });
  })
  

  it('think.statusAction is prevent', function(done){
    think.prevent().catch(function(err){
      return think.statusAction(500, {error: err});
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('think.statusAction has _error', function(done){
    var err = new Error('wwww');
    var flag = false;
    var http = {error: err, _error: true, status: function(status){
      assert.equal(status, 404);
      return {
        end: function(){
          flag = true;
        }
      }
    }}
    muk(think, 'log', function(){})
    think.statusAction(404, http).catch(function(data){
      assert.equal(flag, true);
      muk.restore();
      done();
    })
  })
  it('think.statusAction error controller not found', function(done){
    var error = new Error('xxx');
    var http = {error: error, status: function(){
      return {end: function(){}}
    }, pathname: 'index/ddd', url: 'index/ddd'};
    muk(think, 'log', function(){})
    think.statusAction(400, http).catch(function(err){
      assert.equal(think.isPrevent(err), true)
      done();
    })
  })
  it('think.statusAction error controller not found, log error', function(done){
    var error = new Error('xxx');
    var http = {error: error, status: function(){
      return {end: function(){}}
    }, pathname: 'index/ddd', url: 'index/ddd'};
    muk(think, 'log', function(){})
    think.statusAction(400, http, true).catch(function(err){
      assert.equal(think.isPrevent(err), true)
      done();
    })
  })

  it('think.parallelLimit normal', function(done){
    think.parallelLimit('key', 'name', function(name){
      return name;
    }).then(function(data){
      assert.equal(data, 'name');
      done();
    })
  })

  it('think.parallelLimit normal, is not function', function(done){
    try{
      think.parallelLimit('keywwww', 'name', {limit: 10});
      assert.equal(1, 2);
    }catch(e){
      done();
    };
  })

  it('think.parallelLimit normal, with options', function(done){
    think.parallelLimit('key', 'name', function(name){
      return name;
    }, {limit: 10}).then(function(data){
      assert.equal(data, 'name');
      done();
    })
  })
  it('think.parallelLimit key is not set', function(done){
    think.parallelLimit('data', function(name){
      return name;
    }).then(function(data){
      assert.equal(data, 'data');
      done();
    })
  })
  it('think.parallelLimit key is not string', function(done){
    think.parallelLimit({name: 'thinkjs'}, function(name){
      return name;
    }).then(function(data){
      assert.deepEqual(data, {name: 'thinkjs'});
      done();
    })
  })
  it('think.parallelLimit key is array', function(done){
    think.parallelLimit(['thinkjs', 'test'], function(name){
      return name;
    }, {array: true}).then(function(data){
      assert.deepEqual(data, ['thinkjs', 'test']);
      done();
    })
  })
  it('think.parallelLimit key is array, reject', function(done){
    think.parallelLimit(['thinkjs', 'test'], function(name){
      return Promise.reject(new Error('error'));
    }, {array: true}).catch(function(err){
      assert.deepEqual(err.message, 'error');
      done();
    })
  })
  it('think.parallelLimit key is array, add many, empty', function(done){
    think.parallelLimit([], function(name){
      return name + 'www';
    }).then(function(data){
      assert.deepEqual(data, undefined);
      done();
    })
  })
  it('think.parallelLimit key is array, add many', function(done){
    think.parallelLimit(['thinkjs', 'test'], function(name){
      return name + 'www';
    }).then(function(data){
      assert.deepEqual(data, ['thinkjswww', 'testwww']);
      done();
    })
  })
  it('think.parallelLimit key is array, add many, reject', function(done){
    think.parallelLimit(['thinkjs', 'test'], function(name){
      return Promise.reject(new Error(name))
    }).catch(function(err){
      assert.deepEqual(err.message, 'thinkjs');
      done();
    })
  })
  it('think.parallelLimit key is array, add many, reject, ignore error', function(done){
    think.parallelLimit(['thinkjs', 'test'], function(name){
      return Promise.reject(new Error(name))
    }, {ignoreError: true}).then(function(data){
      assert.deepEqual(data, [null,null]);
      done();
    })
  })
  it('think.parallelLimit key is array, add many, reject, ignore error 1', function(done){
    think.parallelLimit('dddd', ['thinkjs', 'test'], function(name){
      return Promise.reject(new Error(name))
    }, {ignoreError: true}).then(function(data){
      assert.deepEqual(data, [null,null]);
      done();
    })
  })
  it('think.parallelLimit key is array, add many, with limit 1', function(done){
    think.parallelLimit(['thinkjs', 'test'], function(name){
      return name + 'www';
    }, {limit: 1}).then(function(data){
      assert.deepEqual(data, ['thinkjswww', 'testwww']);
      done();
    })
  })
  it('think.parallelLimit key is function', function(done){
    think.parallelLimit(function(name){
      return 'thinkjs';
    }).then(function(data){
      assert.deepEqual(data, 'thinkjs');
      done();
    })
  })
  it('think.parallelLimit key is function, with limit', function(done){
    think.parallelLimit(function(name){
      return 'thinkjs';
    }, 20).then(function(data){
      assert.deepEqual(data, 'thinkjs');
      done();
    })
  })
  it('think.parallelLimit key is function, with limit 2', function(done){
    think.parallelLimit(function(name){
      return 'thinkjs';
    }, {limit: 20}).then(function(data){
      assert.deepEqual(data, 'thinkjs');
      done();
    })
  })


})
















