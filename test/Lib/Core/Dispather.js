var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs')


global.APP_PATH = path.normalize(__dirname + '/../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));


var Http = thinkRequire('Http');
var http = require('http');
var req = new http.IncomingMessage();
req.headers = { 
  'x-real-ip': '127.0.0.1',
  'x-forwarded-for': '127.0.0.1',
  'host': 'meinv.ueapp.com',
  'x-nginx-proxy': 'true',
  'connection': 'close',
  'cache-control': 'max-age=0',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
  'accept-encoding': 'gzip,deflate,sdch',
  'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,nl;q=0.2,zh-TW;q=0.2',
  'cookie': 'Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1=1380544681,1381634417,1381637116,1381660395; bdshare_firstime=1398851688467; visit_count=5; thinkjs=qSK6dvvHE1nDqzeMBOnIiw4LlbPdYGMB; Hm_lvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404201763,1404205823,1404219513,1404342531; Hm_lpvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404357406' 
};
req.method = 'GET';
req.httpVersion = '1.1';
req.url = '/index/index?name=welefen&value=1111';
var res = new http.ServerResponse(req);
res.write = function(){
  return true;
}
var instance = Http(req, res).run();
var Dispatcher = thinkRequire('Dispatcher');

describe('Dispatcher', function(){
  var httpInstance;
  var promise = instance.then(function(http){
    httpInstance = http;
    return thinkRequire('Dispatcher')(http);
  })
  describe('preparePathName', function(){
    it('preparePathName', function(done){
      promise.then(function(instance){
        instance.preparePathName();
        assert.equal(instance.http.pathname, 'index/index')
        done();
      })
    })
    it('preparePathName with prefix', function(done){
      promise.then(function(instance){
        instance.http.pathname = '/prefix/index/index';
        C('url_pathname_prefix', 'prefix')
        instance.preparePathName();
        //console.log(instance.http.pathname)
        assert.equal(instance.http.pathname, '/index/index')
        done();
      })
    })
    it('preparePathName with prefix', function(done){
      promise.then(function(instance){
        instance.http.pathname = '/prefix/index/index.html';
        C('url_pathname_prefix', 'prefix');
        instance.preparePathName();
        //console.log(instance.http.pathname)
        assert.equal(instance.http.pathname, '/index/index')
        done();
      })
    })
  })
  describe('parsePathName', function(){
    it('group is set', function(done){
      promise.then(function(instance){
        instance.http.group = 'home';
        instance.parsePathName();
        assert.equal(instance.http.group, 'home');
        assert.equal(instance.http.controller, undefined);
        assert.equal(instance.http.action, undefined)
        delete instance.http.group;
        delete instance.http.controller;
        delete instance.http.action;
        done();
      })
    })
    it('group', function(done){
      promise.then(function(instance){
        instance.parsePathName();
        assert.equal(httpInstance.group, 'Home');
        assert.equal(httpInstance.controller, 'Index');
        assert.equal(httpInstance.action, 'index')
        done();
      })
    })
    it('group, admin', function(done){
      promise.then(function(instance){
        httpInstance.pathname = 'admin/index/index';
        delete httpInstance.group;
        instance.parsePathName();
        assert.equal(httpInstance.group, 'Admin');
        assert.equal(httpInstance.controller, 'Index');
        assert.equal(httpInstance.action, 'index')
        done();
      })
    })
    it('group, admin, pars', function(done){
      promise.then(function(instance){
        httpInstance.pathname = 'admin/index/index/name/welefen';
        delete httpInstance.group;
        httpInstance.get = {};
        instance.parsePathName();
        assert.equal(httpInstance.group, 'Admin');
        assert.equal(httpInstance.controller, 'Index');
        assert.equal(httpInstance.action, 'index');
        assert.deepEqual(httpInstance.get, { name: 'welefen' });
        done();
      })
    })
    it('group, admin, pars', function(done){
      promise.then(function(instance){
        httpInstance.pathname = 'admin/index/index/name/welefen/value';
        delete httpInstance.group;
        httpInstance.get = {};
        instance.parsePathName();
        assert.equal(httpInstance.group, 'Admin');
        assert.equal(httpInstance.controller, 'Index');
        assert.equal(httpInstance.action, 'index');
        assert.deepEqual(httpInstance.get, { name: 'welefen', value: '' });
        done();
      })
    })
  })
  describe('run', function(){
    it('run', function(done){
      promise.then(function(instance){
        return instance.run();
      }).then(function(){
        done()
      })
    })
  })
  describe('Dispatcher.splitPathName', function(){
    it('splitPathName empty str', function(){
      var data = Dispatcher.splitPathName('');
      assert.deepEqual(data, [])
    })
    it('splitPathName start with /', function(){
      var data = Dispatcher.splitPathName('/welefen');
      assert.deepEqual(data, ['welefen'])
    })
    it('splitPathName has //', function(){
      var data = Dispatcher.splitPathName('/welefen//suredy');
      assert.deepEqual(data, ['welefen', 'suredy'])
    })
    it('splitPathName end with /', function(){
      var data = Dispatcher.splitPathName('/welefen//suredy/');
      assert.deepEqual(data, ['welefen', 'suredy'])
    })
  })

  describe('Dispatcher.getGroup', function(){
    it('group empty', function(){
      var group = Dispatcher.getGroup();
      assert.equal(group, 'Home');
    })
    it('group', function(){
      var group = Dispatcher.getGroup('test');
      assert.equal(group, 'Test');
    })
    it('group super', function(){
      var group = Dispatcher.getGroup('TEST');
      assert.equal(group, 'Test')
    })
  })

  describe('Dispatcher.getController', function(){
    it('controller', function(){
      var controller = Dispatcher.getController();
      assert.equal(controller, 'Index');
    })
    it('controller', function(){
      var controller = Dispatcher.getController('test');
      assert.equal(controller, 'Test');
    })
    it('controller super', function(){
      var controller = Dispatcher.getController('Test');
      assert.equal(controller, 'Test');
    })
    it('controller invalid', function(){
        var controller = Dispatcher.getController('==fasf');
        assert.equal(controller, '');
    })
  })
  describe('Dispatcher.getAction', function(){
    it('empty action', function(){
      var action = Dispatcher.getAction();
      assert.equal(action, 'index');
    })
    it('action', function(){
      var action = Dispatcher.getAction('test');
      assert.equal(action, 'test');
    })
    it('action 1', function(){
      var action = Dispatcher.getAction('TEST');
      assert.equal(action, 'TEST');
    })
    it('action invalid', function(){
        var action = Dispatcher.getAction('====werwe');
        assert.equal(action, '')
    })
  })


})