'use strict';

for(var filepath in require.cache){
  delete require.cache[filepath];
}

var thinkjs = require('../../lib/core/think.js');
var assert = require('assert');
var thinkit = require('thinkit');
var path = require('path');

think.APP_PATH = path.dirname(__dirname) + '/testApp';

describe('core/think.js', function(){
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
      local: 'local'
    })
  })
  it('think.debug is boolean', function(){
    assert.equal(typeof think.debug, 'boolean');
  })
  it('think.port is number', function(){
    assert.equal(typeof think.port, 'number');
  })
  it('think.cli is boolean', function(){
    assert.equal(typeof think.cli, 'boolean');
  })

  describe('think.mode', function(){
    it('think.mode is 1', function(){
      assert.equal(think.mode, 1);
    })
    it('think.mode_mini is 1', function(){
      assert.equal(think.mode_mini, 1);
    })
    it('think.mode_normal is 2', function(){
      assert.equal(think.mode_normal, 2);
    })
    it('think.mode_module is 4', function(){
      assert.equal(think.mode_module, 4);
    })
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

  describe('think.base', function(){
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
  })
  describe('think.defer', function(){
    it('think.defer is function', function(){
      assert.equal(typeof think.defer, 'function')
    })
    it('think.defer methods', function(){
      var deferred = think.defer();
      assert.equal(typeof deferred.promise, 'object')
      assert.equal(typeof deferred.resolve, 'function')
      assert.equal(typeof deferred.reject, 'function')
    })
  })
  describe('think.reject', function(){
    it('think.reject is reject', function(){
      assert.equal(typeof think.reject, 'function')
    })
    it('think.reject methods', function(done){
      var err = new Error();
      var reject = think.reject(err);
      reject.catch(function(e){
        assert.equal(err, e);
        done();
      })
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
  describe('think.Class', function(){
    it('think.Class is function', function(){
      assert.equal(typeof think.Class, 'function');
    })
    it('think.Class({})', function(){
      var cls = think.Class({});
      var instance = new cls();
      assert.equal('__initReturn' in instance, true);
      assert.equal(typeof instance.config, 'function');
      assert.equal(typeof instance.controller, 'function');
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
    describe('think.Class("controller")', function(){
      it('controller is a function', function(){
        var fn = think.Class('controller');
        assert.equal(typeof fn, 'function');
      })
      it('controller({}) is a function', function(){
        var fn = think.Class('controller');
        var cls = fn({});
        assert.equal(typeof cls, 'function');
      })
      it('controller() is null', function(){
        var fn = think.Class('controller');
        var cls2 = fn();
        assert.equal(cls2, null);
      })
      it('controller("controller_base") is function', function(){
        var fn = think.Class('controller');
        var cls2 = fn('controller_base');
        assert.equal(typeof cls2, 'function');
      })
      it('controller(superClass)', function(){
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
    })
  })
  describe('think.lookClass', function(){
    it('think.lookClass("module/not/found") not found', function(){
      try{
        think.lookClass('module/not/found')
      }catch(e){
        var message = e.message;
        assert.equal(message.indexOf('module/not/found') > -1, true);
      }
    })
    it('think.lookClass("module/is/exist") is function', function(){
      think._aliasExport['module/is/exist'] = function(){
        return 'module/is/exist';
      }
      var fn = think.lookClass('module/is/exist');
      assert.equal(fn(), 'module/is/exist');
      think._aliasExport = {};
    })
    it('think.lookClass("home/group", "controller") not found', function(){
      try{
        think.lookClass("home/group", "controller")
      }catch(e){
        assert.equal(e.message.indexOf('home/controller/group') > -1, true);
      }
    })
    it('think.lookClass("home/group", "service") is function', function(){
      think._aliasExport['home/service/group'] = function(){
        return 'home/service/group';
      }
      var fn = think.lookClass("home/group", "service");
      assert.equal(fn(), 'home/service/group');
      think._aliasExport = {};
    })
    it('think.lookClass("detail", "controller", "home") not found', function(){
      var cls = think.lookClass('detail', 'controller', 'home');
      assert.equal(cls, null);
    })
    it('think.lookClass("group", "controller", "home") is function', function(){
      think._aliasExport['home/controller/group'] = function(){
        return 'home/controller/group';
      }
      var fn = think.lookClass('group', 'controller', 'home');
      assert.equal(fn(), 'home/controller/group');
      delete think._aliasExport['home/controller/group'];
    })
    it('think.lookClass("group", "controller", "home1") is function', function(){
      var mode = think.mode;
      think.mode = think.mode_module;
      think._aliasExport['common/controller/group'] = function(){
        return 'common/controller/group';
      }
      var fn = think.lookClass('group', 'controller', 'home1');
      assert.equal(fn(), 'common/controller/group');
      think.mode = mode;
      delete think._aliasExport['common/controller/group'];
    })
  })

  describe('think.getPath', function(){
    it('think.getPath is function', function(){
      assert.equal(think.isFunction(think.getPath), true);
    })
    it('mode mini', function(){
      var mode = think.mode;
      think.mode = think.mode_mini;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';

      var path = think.getPath();
      assert.equal(path, '/path/to/project/app/controller');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode mini with model', function(){
      var mode = think.mode;
      think.mode = think.mode_mini;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';

      var path = think.getPath(think.dirname.common, think.dirname.model);
      assert.equal(path, '/path/to/project/app/model');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode mini with view', function(){
      var mode = think.mode;
      think.mode = think.mode_mini;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';

      var path = think.getPath(think.dirname.common, think.dirname.view);
      assert.equal(path, '/path/to/project/app/view');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode normal', function(){
      var mode = think.mode;
      think.mode = think.mode_normal;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';
      think.config('default_module', 'home')
      var path = think.getPath();
      assert.equal(path, '/path/to/project/app/controller/home');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode normal with model', function(){
      var mode = think.mode;
      think.mode = think.mode_normal;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';
      think.config('default_module', 'home')
      var path = think.getPath(undefined, think.dirname.model);
      assert.equal(path, '/path/to/project/app/model/home');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode normal with view', function(){
      var mode = think.mode;
      think.mode = think.mode_normal;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';
      think.config('default_module', 'home')
      var path = think.getPath(undefined, think.dirname.view);
      assert.equal(path, '/path/to/project/app/view/home');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode normal with view & module', function(){
      var mode = think.mode;
      think.mode = think.mode_normal;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';
      think.config('default_module', 'home')
      var path = think.getPath('welefen', think.dirname.view);
      assert.equal(path, '/path/to/project/app/view/welefen');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode module', function(){
      var mode = think.mode;
      think.mode = think.mode_module;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';
      var path = think.getPath();
      assert.equal(path, '/path/to/project/app/common/controller');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode module with model', function(){
      var mode = think.mode;
      think.mode = think.mode_module;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';
      var path = think.getPath(undefined, think.dirname.model);
      assert.equal(path, '/path/to/project/app/common/model');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
    it('mode module with model & module', function(){
      var mode = think.mode;
      think.mode = think.mode_module;
      var APP_PATH = think.APP_PATH;
      think.APP_PATH = '/path/to/project/app';
      var path = think.getPath('test', think.dirname.model);
      assert.equal(path, '/path/to/project/app/test/model');
      think.mode = mode;
      think.APP_PATH = APP_PATH;
    })
  })
  
  describe('think.require', function(){
    it('think.require is function', function(){
      assert.equal(think.isFunction(think.require), true)
    })
    it('think.require({})', function(){
      var data = think.require({});
      assert.deepEqual(data, {})
    })
    it('think.require is in _aliasExport', function(){
      var data = think._aliasExport;
      var fn = function(){};
      think._aliasExport = {
        '_test_': fn
      }
      var result = think.require('_test_')
      assert.equal(result, fn);
      think._aliasExport = data;
    })
    it('think.require is in _alias', function(){
      var data = think._alias;
      think._alias = {
        '_test_': __filename + '/a.js'
      }
      var result = think.require('_test_');
      assert.equal(result, null);
      think._alias = data;
    })
    it('think.require is in _alias', function(){
      var data = think._alias;
      think._alias = {
        '_test_': path.normalize(__dirname + '/../../lib/index.js')
      }
      var result = think.require('_test_');
      assert.equal(think.isFunction(result), true)
      think._alias = data;
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


  })

  describe('think.safeRequire', function(){
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

  })

  describe('think.prevent', function(){
    it('think.prevent is function', function(){
      assert.equal(think.isFunction(think.prevent), true)
    })
    it('think.prevent', function(done){
      think.prevent().catch(function(err){
        assert.equal(err.message, 'PREVENT_NEXT_PROCESS');
        done();
      })
    })
  })
  describe('think.isPrevent', function(){
    it('think.isPrevent is function', function(){
      assert.equal(think.isFunction(think.isPrevent), true)
    })
    it('think.isPrevent', function(done){
      think.prevent().catch(function(err){
        assert.equal(think.isPrevent(err), true);
        done();
      })
    })
  })


  describe('think.log', function(){
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
    it('think.log with type', function(){
      var log = console.log;
      console.log = function(msg){
        assert.equal(msg.indexOf('test') > -1, true);
        assert.equal(msg.indexOf('[TEST]') > -1, true);
      }
      think.log('test', 'TEST');
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
  })

  describe('think.config', function(){
    it('think.config is function', function(){
      assert.equal(think.isFunction(think.config), true);
    })
    it('think.config get all data', function(){
      var data = think._config;
      think._config = {name: 'welefen'}
      var result = think.config();
      assert.deepEqual(result, {name: 'welefen'});
      think._config = data;
    })
    it('think.config set data', function(){
      var data = think._config;
      think._config = {};
      think.config({name: 'welefen'});
      var result = think.config();
      assert.deepEqual(result, {name: 'welefen'});
      think._config = data;
    })
    it('think.config get data', function(){
      var data = think._config;
      think._config = {};
      think.config({name: 'welefen'});
      var result = think.config('name');
      assert.deepEqual(result, 'welefen');
      think._config = data;
    })
    it('think.config set data with value', function(){
      var data = think._config;
      think._config = {};
      think.config('name', 'welefen');
      var result = think.config('name');
      assert.deepEqual(result, 'welefen');
      think._config = data;
    })
    it('think.config set data with value 2', function(){
      var data = think._config;
      think._config = {};
      think.config('name.value', 'welefen');
      var result = think.config('name.value');
      assert.deepEqual(result, 'welefen');
      think._config = data;
    })
    it('think.config set data with value 3', function(){
      var data = think._config;
      think._config = {};
      think.config('name.value', 'welefen');
      var result = think.config('name');
      assert.deepEqual(result, {value: 'welefen'});
      think._config = data;
    })
    it('think.config set data with value 4', function(){
      var data = think._config;
      think._config = {};
      think.config('name.value', 'welefen');
      think.config('name.test', 'suredy')
      var result = think.config('name');
      assert.deepEqual(result, {value: 'welefen', test: 'suredy'});
      think._config = data;
    })
    it('think.config set data with value 5', function(){
      var data = think._config;
      think._config = {};
      think.config('name.value', 'welefen');
      var result = think.config('name.value111');
      assert.deepEqual(result, undefined);
      think._config = data;
    })
    it('think.config set data with value 6', function(){
      var data = think._config;
      think._config = {};
      think.config('name.value', 'welefen');
      var result = think.config('name1111.value111');
      assert.deepEqual(result, undefined);
      think._config = data;
    })
    it('think.config set data with value 7', function(){
      var data = think._config;
      think._config = {};
      think.config([]);
      var result = think.config('name1111.value111');
      assert.deepEqual(result, undefined);
      think._config = data;
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
  })


  describe('think.getModuleConfig', function(){
      it('think.getModuleConfig is function', function(){
        assert.equal(think.isFunction(think.getModuleConfig), true);
      })
      it('think.getModuleConfig get sys config', function(){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var configs = think.getModuleConfig(true);
        assert.deepEqual(Object.keys(configs).sort(), [ 'action_suffix', 'cache', 'call_controller', 'callback_name', 'cluster_on', 'cookie', 'create_server', 'db', 'default_action', 'default_controller', 'default_module', 'deny_module_list', 'encoding', 'error', 'hook_on', 'host', 'html_cache', 'json_content_type', 'local', 'log_pid', 'memcache', 'output_content', 'package', 'pathname_prefix', 'pathname_suffix', 'port', 'post', 'proxy_on', 'redis','resource_on','resource_reg','route_on','session','sub_domain','subdomain','timeout','token','tpl','websocket' ]);
        assert.equal(think.isObject(configs), true);
        think._moduleConfig = _moduleConfig;
      })
      it('think.getModuleConfig get sys config', function(){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var configs = think.getModuleConfig(true);
        var configs2 = think.getModuleConfig(true);
        assert.equal(configs, configs2);
        think._moduleConfig = _moduleConfig;
      })
      it('think.getModuleConfig get sys config, with cli', function(){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var cli = think.cli;
        think.cli = true;
        var configs = think.getModuleConfig(true);
        assert.equal(think.isObject(configs), true);
        assert.equal(configs.auto_reload, false);
        think._moduleConfig = _moduleConfig;
        think.cli = cli;
      })
      it('think.getModuleConfig get sys config, with debug', function(){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var debug = think.debug;
        think.debug = true;
        var configs = think.getModuleConfig(true);
        assert.equal(think.isObject(configs), true);
        assert.equal(configs.auto_reload, true);
        think._moduleConfig = _moduleConfig;
        think.debug = debug;
      })
      it('think.getModuleConfig get common config', function(){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var debug = think.debug;
        think.debug = true;
        var configs = think.getModuleConfig();
        assert.equal(think.isObject(configs), true);
        assert.equal(configs.auto_reload, undefined);
        think._moduleConfig = _moduleConfig;
        think.debug = debug;
      })

      it('think.getModuleConfig get common config', function(done){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var appPath = think.APP_PATH + '/config/';
        think.mkdir(appPath);

        var fs = require('fs');
        fs.writeFileSync(appPath + '/config.js', 'module.exports = {welefen: "suredy"}');
        think.mode = think.mode_mini;
        var configs = think.getModuleConfig();
        assert.equal(configs.welefen, 'suredy');
        think._moduleConfig = _moduleConfig;
        think.rmdir(think.APP_PATH).then(done);
      })
      it('think.getModuleConfig get common config', function(done){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var appPath = think.APP_PATH + '/config/';
        think.mkdir(appPath);

        var fs = require('fs');
        fs.writeFileSync(appPath + '/aaa.js', 'module.exports = {welefen: "suredy"}');
        think.mode = think.mode_mini;
        var configs = think.getModuleConfig();
        assert.deepEqual(configs.aaa, {welefen: 'suredy'});
        think._moduleConfig = _moduleConfig;
        think.rmdir(think.APP_PATH).then(done);
      })
      it('think.getModuleConfig get common config', function(done){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var appPath = think.APP_PATH + '/config/';
        think.mkdir(appPath);

        var fs = require('fs');
        fs.writeFileSync(appPath + '/_aaa.js', 'module.exports = {welefen: "suredy"}');
        think.mode = think.mode_mini;
        var configs = think.getModuleConfig();
        assert.deepEqual(configs.aaa, undefined);
        think._moduleConfig = _moduleConfig;
        think.rmdir(think.APP_PATH).then(done);
      })
      it('think.getModuleConfig get common config', function(done){
        var _moduleConfig = think._moduleConfig;
        think._moduleConfig = {};
        var appPath = think.APP_PATH + '/config/local';
        think.mkdir(appPath);

        var fs = require('fs');
        fs.writeFileSync(appPath + '/en.js', 'module.exports = {welefen: "suredy"}');
        think.mode = think.mode_mini;
        var configs = think.getModuleConfig();
        assert.deepEqual(configs.local, { en: { welefen: 'suredy' } });
        think._moduleConfig = _moduleConfig;
        think.rmdir(think.APP_PATH).then(done);
      })
  })

})
















