var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var _http = require('../_http.js');

var thinkjs = require('../../lib/index.js');

var tjs = new thinkjs();
tjs.load();

var App = require('../../lib/core/app.js');

describe('core/app.js', function(){
  it('init', function(){
    var instance = new App({});
    assert.equal(think.isFunction(instance.run), true)
  })
  it('execLogic, cls not exist', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    muk(think, 'require', function(){
      return null;
    })
    instance.execLogic().then(function(data){
      assert.equal(data, undefined);
      muk.restore();
      done();
    })
  })
  it('execLogic, cls & action exist', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    muk(think, 'require', function(){
      return think.Class({
        listAction: function(){
          return 111;
        }
      });
    })
    instance.execLogic().then(function(data){
      assert.equal(data, 111)
      muk.restore();
      done();
    })
  })
  it('execLogic, cls has __call', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    muk(think, 'require', function(){
      return think.Class({
        __call: function(){
          return 222;
        }
      });
    })
    instance.execLogic().then(function(data){
      assert.equal(data, 222)
      muk.restore();
      done();
    })
  })
  it('execLogic, cls has __before', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    muk(think, 'require', function(){
      return think.Class({
        __before: function(){
          return Promise.resolve(333);
        }
      });
    })
    instance.execLogic().then(function(data){
      assert.equal(data, 333)
      muk.restore();
      done();
    })
  })
  it('execLogic, cls no method', function(){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    muk(think, 'require', function(){
      return think.Class();
    })
    instance.execLogic();
    muk.restore();
  })
  it('execController, controller exist', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    muk(think, 'require', function(){
      return think.Class({});
    })
    instance.execAction = function(ins){
      assert.equal(think.isObject(ins), true)
      return Promise.resolve();
    }
    instance.execController().then(function(){
      muk.restore();
      done();
    })
  })
  it('execController, controller not exist', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    muk(think, 'require', function(){
      return null;
    })
    muk(think, 'statusAction', function(status, http){
      assert.equal(status, 404);
      assert.equal(think.isError(http.error), true);
      return Promise.resolve();
    })
    instance.execController().then(function(){
      muk.restore();
      done();
    })
  })
  it('execAction, _isRest', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list',method: 'get'});
    var controller = {
      _isRest: true,
      getAction: function(){}
    }
    instance.action = function(controller, action){
      assert.equal(action, 'get');
      return Promise.resolve();
    }
    instance.execAction(controller).then(function(){
      muk.restore();
      done();
    })
  })
  it('execAction, _isRest, _method', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list',method: 'get', _get: {_method: 'user_add'}});
    var controller = {
      _isRest: true,
      _method: '_method',
      get: function(){
        return 'user_add'
      },
      userAddAction: function(){}
    }
    instance.action = function(controller, action){
      assert.equal(action, 'userAdd');
      return Promise.resolve();
    }
    instance.execAction(controller).then(function(){
      muk.restore();
      done();
    })
  })
  it('execAction, action exist', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list'});
    var controller = {
      listAction: function(){}
    }
    instance.action = function(controller, action){
      assert.equal(action, 'list');
      return Promise.resolve();
    }
    instance.execAction(controller).then(function(){
      muk.restore();
      done();
    })
  })
  it('execAction, action exist 1', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add'});
    var controller = {
      listAddAction: function(){}
    }
    instance.action = function(controller, action){
      assert.equal(action, 'listAdd');
      return Promise.resolve();
    }
    instance.execAction(controller).then(function(){
      muk.restore();
      done();
    })
  })
  it('execAction, __call exist', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add1'});
    var controller = {
      __call: function(){}
    }
    instance.action = function(controller, action){
      assert.equal(action, '__call');
      return Promise.resolve();
    }
    instance.execAction(controller).then(function(){
      muk.restore();
      done();
    })
  })
  it('execAction, action not exist', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add2'});
    var controller = {
      
    }
    muk(think, 'statusAction', function(status, http){
      assert.equal(status, 404);
      assert.equal(think.isError(http.error), true);
      return Promise.resolve();
    })
    instance.execAction(controller).then(function(){
      muk.restore();
      done();
    })
  })
  it('exec', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add3'});
    instance.execLogic = function(){
      return Promise.resolve();
    }
    instance.hook = function(){
      return Promise.resolve();
    }
    instance.execController = function(){
      return Promise.resolve();
    }
    instance.exec().then(function(){
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('exec, is end', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add4'});
    instance.execLogic = function(){
      return Promise.resolve();
    }
    instance.http._isEnd = true;
    instance.execController = function(){
      return Promise.resolve();
    }
    instance.hook = function(){
      return Promise.resolve();
    }
    instance.exec().catch(function(err){
      assert.equal(think.isPrevent(err), true)
      muk.restore();
      done();
    })
  })
  // it('run, service off', function(done){
  //   var instance = new App({module: 'home', controller: 'test', action: 'list_add5', header: function(){}});
  //   think.config('service_on', false);
  //   muk(think, 'statusAction', function(status, http, log){
  //     assert.equal(status, 503);
  //     assert.equal(log, undefined);
  //     return Promise.resolve();
  //   })
  //   instance.run().then(function(){
  //     think.config('service_on', true);
  //     muk.restore();
  //     done();
  //   })
  // })
  // it('run, proxy on', function(done){
  //   var instance = new App({module: 'home', controller: 'test', action: 'list_add6', hostname: '127.0.0.1', header: function(){}});
  //   think.config('proxy_on', true);
  //   muk(think, 'statusAction', function(status, http, log){
  //     assert.equal(status, 403);
  //     assert.equal(log, undefined);
  //     return Promise.resolve();
  //   })
  //   instance.run().then(function(){
  //     think.config('proxy_on', false);
  //     muk.restore();
  //     done();
  //   })
  // })
  it('run, domain error', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add7', hostname: '127.0.0.1', header: function(){}});
    var flag = false;
    muk(think, 'statusAction', function(status, http, log){
      assert.equal(status, 500);
      assert.equal(log, true);
      flag = true;
      return Promise.resolve();
    })
    var domain = require('domain');
    muk(domain, 'create', function(){
      return {
        on: function(type, callback){
          callback && callback(new Error());
        },
        run: function(){

        }
      }
    })
    instance.run();
    muk.restore();
    assert.equal(flag, true)
    done();
  })
  it('run, normal', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add8', hostname: '127.0.0.1', header: function(){}});
    var domain = require('domain');
    var flag = false;
    instance.exec = function(){
      flag = true;
      return Promise.resolve();
    }
    muk(domain, 'create', function(){
      return {
        on: function(type, callback){
          //callback && callback(new Error());
        },
        run: function(callback){
          callback && callback();
        }
      }
    })
    instance.run();
    muk.restore();
    assert.equal(flag, true)
    done();
  })
  it('run, error', function(done){
    var instance = new App({module: 'home', controller: 'test', action: 'list_add9', hostname: '127.0.0.1', header: function(){}});
    var domain = require('domain');
    var flag = false;

    muk(think, 'statusAction', function(status, http, log){
      assert.equal(status, 500);
      assert.equal(log, true);
      flag = true;
      return Promise.resolve();
    })
    instance.exec = function(){
      return Promise.reject(new Error());
    }
    muk(domain, 'create', function(){
      return {
        on: function(type, callback){
          //callback && callback(new Error());
        },
        run: function(callback){
          callback && callback();
        }
      }
    })
    instance.run();
    setTimeout(function(){
      muk.restore();
      assert.equal(flag, true)
      done();
  }, 50)
  })
})