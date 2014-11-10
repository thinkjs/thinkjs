var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs')

global.APP_PATH = path.normalize(__dirname + '/../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));


var clearRequireCache = function(){
  for(var name in require.cache){
    if (name.indexOf('/Controller/Home/IndexController.js') > -1) {
      delete require.cache[name];
    }
  }
}


var App = thinkRequire('App');
describe('App', function(){
  it('getBaseController', function(){
    var c = App.getBaseController({});
    assert.equal(c, undefined);
  })
  it('getBaseController', function(){
    var c = App.getBaseController({controller: 'index'});
    assert.equal(c, undefined);
  })
  it('getBaseController', function(done){
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({indexAction: function(){}})')
    var c = App.getBaseController({group: 'Home', controller: 'Index', action: 'index'});
    assert.equal(isObject(c), true);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('getCallController, RestController', function(){
    var http = {isRestful: true, get: {resource: 'user'}};
    var c = App.getCallController(http);
    assert.equal(c instanceof thinkRequire('RestController'), true)
  })
  it('getCallController, null', function(){
    var http = {get: {resource: 'user'}};
    var c = App.getCallController(http);
    assert.equal(c, null)
  })
  it('getCallController, call_controller empty', function(){
    var http = {get: {resource: 'user'}};
    C('call_controller', '')
    var c = App.getCallController(http);
    assert.equal(c, undefined)
  })
  it('getCallController, call_controller', function(done){
    var http = {get: {resource: 'user'}};
    C('call_controller', 'Home:Index:_404')
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({_404Action: function(){}})')
    clearRequireCache();
    var c = App.getCallController(http);
    assert.equal(isFunction(c._404Action), true)
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('execAction', function(done){
    clearRequireCache();
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({indexAction: function(){return "welefen"}})')
    var controller = App.getBaseController({group: 'Home', controller: 'Index', action: 'index'});
    App.execAction(controller, 'index').then(function(data){
      assert.equal(data, 'welefen');
      rmdir(path.normalize(__dirname + '/../../App')).then(done)
    })
  })
  it('execAction, call', function(done){
    clearRequireCache();
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({__call: function(){return "call"}})')
    var controller = App.getBaseController({group: 'Home', controller: 'Index', action: 'index'});
    App.execAction(controller, 'index', [], true).then(function(data){
      assert.equal(data, 'call');
      rmdir(path.normalize(__dirname + '/../../App')).then(done)
    })
  })
  it('execAction, call not exist', function(done){
    clearRequireCache();
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({testAction: function(){return "call"}})')
    var controller = thinkRequire('Home/IndexController')({});
    App.execAction(controller, 'index', [], true).catch(function(err){
      assert.equal(err.message, 'action `index` not found.');
      rmdir(path.normalize(__dirname + '/../../App')).then(done)
    })
  })
  it('execAction, before', function(done){
    clearRequireCache();
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({__before: function(){return "__before"}, indexAction: function(data){return data}})')
    var controller = App.getBaseController({group: 'Home', controller: 'Index', action: 'index'});
    App.execAction(controller, 'index', [], true).then(function(data){
      //console.log(data)
      assert.equal(data, undefined);
      rmdir(path.normalize(__dirname + '/../../App')).then(done)
    })
  })
  it('execAction, before', function(done){
    clearRequireCache();
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({__before: function(){return "__before"}, indexAction: function(data){return data}})')
    var controller = App.getBaseController({group: 'Home', controller: 'Index', action: 'index'});
    App.execAction(controller, 'index', ['__before'], true).then(function(data){
      //console.log(data)
      assert.equal(data, '__before');
      rmdir(path.normalize(__dirname + '/../../App')).then(done)
    })
  })
  it('execAction, after', function(done){
    clearRequireCache();
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({__after: function(){return "__after"}, indexAction: function(data){return data}})')
    var controller = App.getBaseController({group: 'Home', controller: 'Index', action: 'index'});
    App.execAction(controller, 'index', [], true).then(function(data){
      //console.log(data)
      assert.equal(data, '__after');
      rmdir(path.normalize(__dirname + '/../../App')).then(done)
    })
  })
  it('getActionParams', function(){
    var http = {get: {}, post: {}};
    var data = App.getActionParams(function(){}, http);
    assert.deepEqual(data, [])
  })
  it('getActionParams, id', function(){
    var http = {get: {}, post: {}};
    var data = App.getActionParams(function(id){}, http);
    assert.deepEqual(data, [''])
  })
  it('getActionParams, id with comment', function(){
    var http = {get: {}, post: {}};
    var data = App.getActionParams(function(id/**name*/){

    }, http);
    assert.deepEqual(data, [''])
  })
  it('getActionParams, multi pars', function(){
    var http = {get: {}, post: {}};
    var data = App.getActionParams(function(id, name){

    }, http);
    assert.deepEqual(data, ['', ''])
  })
  it('exec, controller not exist', function(done){
    APP_DEBUG = true;
    var http = {group: 'home', controller: 'test111', action: 'index', pathname: '/test'}
    App.exec(http).catch(function(err){
      console.log(err.message)
      assert.equal(err.message, "Controller `test111` not found. pathname is `/test`");
      APP_DEBUG = false;
      done();
    })
  })
  it('exec, controller not exist', function(done){
    var http = {group: 'home', action: 'index', pathname: '/test'};
    APP_DEBUG = true;
    App.exec(http).catch(function(err){
      assert.equal(err.message, "Controller not found. pathname is `/test`");
      APP_DEBUG = false;
      done();
    })
  })
  it('exec, __call exist, _404 not exist', function(){
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({__call: function(){return "__call"}})')
    var http = {group: 'Home', controller:'Index', action: 'test', pathname: '/testddd', post: {}, get: {}}
    APP_DEBUG = true;
    App.exec(http).catch(function(err){
      assert.equal(err.message, "action not found. pathname is `/testddd`");
      APP_DEBUG = false;
      done();
    })
  })
  it('exec, action not exist', function(){
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({__after: function(){return "__after"}})')
    var http = {group: 'Home', controller:'Index', action: 'test', pathname: '/test', post: {}, get: {}}
    App.exec(http).catch(function(err){
      assert.equal(err.message, "action not found. pathname is `/test`");
      done();
    })
  })
  it('exec, controller exist', function(){
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({__after: function(){return "__after"}, indexAction: function(x){return x}})')
    var http = {group: 'Home', controller:'Index', action: 'index', pathname: '/test', post: {}, get: {}}
    App.exec(http).then(function(data){
      assert.equal(data, '__after');
      done();
    })
  })
  it('exec, controller exist', function(){
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({indexAction: function(){return "wwww"}})')
    var http = {group: 'Home', controller:'Index', action: 'index', pathname: '/test', post: {}, get: {}}
    App.exec(http).then(function(data){
      assert.equal(data, 'wwww');
      done();
    })
  })
  it('exec, controller exist', function(){
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({indexAction: function(x){return x}})')
    var http = {group: 'Home', controller:'Index', action: 'index', pathname: '/test', post: {x: 'welefen'}, get: {}}
    App.exec(http).then(function(data){
      assert.equal(data, 'welefen');
      done();
    })
  })
  it('exec, controller exist, url_params_bind false', function(){
    var filepath = path.normalize(LIB_PATH +　'/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({indexAction: function(x){return x}})')
    var http = {group: 'Home', controller:'Index', action: 'index', pathname: '/test', post: {x: 'welefen'}, get: {}}
    C('url_params_bind', false)
    App.exec(http).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('sendError', function(){
    var data = App.sendError(); 
    assert.equal(data, undefined);
  })
  it('sendError', function(){
    var data = App.sendError({}, 'errormessage'); 
    assert.equal(data, undefined);
  })
  it('sendError', function(){
    var data = App.sendError({}, new Error('errormessage')); 
    assert.equal(data, undefined);
  })
  it('sendError', function(){
    APP_DEBUG = true;
    var http = {res: {statusCode: 200, end: function(errormessage){
      assert.equal(errormessage, 'errormessage')
    }}, setHeader: function(){}}
    App.sendError(http, 'errormessage'); 
  })
  it('sendError', function(){
    APP_DEBUG = false;
    var fn = function(){};
    var http = {res: {on: fn,once: fn, emit: fn, write: fn, statusCode: 200, end: function(errormessage){
      assert.equal(errormessage, undefined)
    }}, setHeader: function(){}}
    App.sendError(http, 'errormessage'); 
  })
  it('run', function(){
    App.run();
    APP_MODE = '';
    App.run();
    APP_MODE = 'cli';
  })

  it('listener', function(done){
    var thinkHttp = thinkRequire('Http');
    var defaultHttp = thinkHttp.getDefaultHttp('/index/index');
    thinkHttp(defaultHttp.req, defaultHttp.res).run().then(function(http){
      App.listener(http).then(function(data){
        assert.equal(data, undefined);
        done();
      })
    });
  })
  it('listener', function(done){
    var thinkHttp = thinkRequire('Http');
    var defaultHttp = thinkHttp.getDefaultHttp('/index/index');
    thinkHttp(defaultHttp.req, defaultHttp.res).run().then(function(http){
      http.host = '127.0.0.1:8360';
      C('use_proxy', true);
      http.res.end = function(){
        done();
      }
      App.listener(http)
    });
  })
  it('createServer', function(done){
    require('http').createServer = function(callback){
      callback({headers: {}}, {});
      done();
      return {on: function(){}, listen: function(){}}
    }
    App.createServer();
  })
  it('createServer', function(done){
    APP_DEBUG = true;
    require('http').createServer = function(callback){
      callback({headers: {}}, {});
      done();
      return {on: function(){}, listen: function(){}}
    }
    App.createServer();
    APP_DEBUG = false;
  })
  it('createServer fn1', function(done){
    C('create_server_fn', function(app){
      assert.equal(app, App);
      done();
    })
    App.createServer();
  })
  it('createServer fn2', function(done){
    C('create_server_fn', '__user_fn1');
    global.__user_fn1 = function(app){
      assert.equal(app, App);
      done();
    }
    App.createServer();
  })
  it('createServer fn2', function(done){
    C('create_server_fn', '__user_fn2');
    require('http').createServer = function(callback){
      callback({headers: {}}, {});
      done();
      return {on: function(){}, listen: function(){}}
    }
    App.createServer();
  })
  it('mode.http', function(done){
    var fn = App.createServer;
    App.createServer = function(){
      done();
      App.createServer = fn;
    }
    App.mode.http();
  })

})

describe('rm tmp files', function(){
  it('rm tmp files', function(done){
    clearRequireCache();
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
})