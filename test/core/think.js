'use strict';

for(var filepath in require.cache){
  delete require.cache[filepath];
}

var thinkjs = require('../../lib/core/think.js');
var assert = require('assert');
var path = require('path');
var thinkit = require('thinkit');

var APP_PATH = path.dirname(__dirname);

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
    it('think.reject methods', function(){
      var err = new Error();
      var reject = think.reject(err);
      reject.catch(function(e){
        assert.equal(err, e);
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
    it('think.lookClass("module/not/found") is not found', function(){
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
    it('think.lookClass("home/group", "controller") is not found', function(){
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
    it('think.lookClass("detail", "controller", "home") is not found', function(){
      var cls = think.lookClass('detail', 'controller', 'home');
      assert.equal(cls, null);
    })
    it('think.lookClass("group", "controller", "home") is function', function(){
      think._aliasExport['home/controller/group'] = function(){
        return 'home/controller/group';
      }
      var fn = think.lookClass('group', 'controller', 'home');
      assert.equal(fn(), 'home/controller/group');
    })
  })
})
















