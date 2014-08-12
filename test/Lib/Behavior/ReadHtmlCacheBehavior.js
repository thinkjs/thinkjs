var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');

global.APP_PATH = path.normalize(__dirname + '/../../App');
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
  'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,nl;q=0.2,zh-TW;q=0.2'
};
req.method = 'GET';
req.httpVersion = '1.1';
req.url = '/index/index/name/welefen?test=welefen&value=1111';
var res = new http.ServerResponse(req);
var instance = Http(req, res).run();
describe('ReadHtmlCacheBehavior', function(){
  var httpInstance;
  function getTestPromise(file){
    return instance.then(function(http){
      httpInstance = http;
      http.group = 'Index';
      http.controller = 'Index';
      http.action = 'index'
      return B('ReadHtmlCache', http, file);
    })
  }
  function getInstance(file){
    return instance.then(function(http){
      httpInstance = http;
      httpInstance = http;
      http.group = 'Index';
      http.controller = 'Index';
      http.action = 'index'
      return thinkRequire('ReadHtmlCacheBehavior')(http);
    })
  }
  describe('run', function(){
    it('disable html cache', function(done){
      C('html_cache_on', false)
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('empty html cache rules', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {})
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('rule not hit', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {
        'index:index:test': ['index_home']
      })
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('rule hit', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {
        'index:index:index': 'index_home'
      })
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('rule hit', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {
        'index:index:index': ['index_home']
      })
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('rule hit', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {
        'index:index:index': ['index_home']
      })
      httpInstance.cookie = {name: 'welefen'}
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('rule hit', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {
        'index:index:index': ['index_{:action}']
      })
      httpInstance.cookie = {name: 'welefen'}
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('rule hit', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {
        'index:index:index': ['index_{:action1}']
      })
      httpInstance.cookie = {name: 'welefen'}
      getTestPromise('').then(function(data){
        assert.equal(data, false)
        done();
      })
    })
    it('rule hit, checkCacheTime', function(done){
      C('html_cache_on', true);
      C('html_cache_rules', {
        'index:index:index': ['index_{:action1}']
      })
      httpInstance.cookie = {name: 'welefen'};
      var file = C('html_cache_path') + '/3/d/3d7c341c622de5c1346d90c9e51e6cbd.html';
      setFileContent(file, 'welefen')
      var fn = httpInstance.end;
      httpInstance.end = function(){
        httpInstance.end = fn;
        console.log('end')
        done();
      }
      getTestPromise('');
    })
  })
  describe('getCacheTime', function(){
    it('empty rules', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_on = true;
        instance.options.html_cache_rules = {};
        var data = instance.getCacheTime();
        assert.equal(data, false)
        done();
      })
    })
    it('not hit', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_on = true;
        instance.options.html_cache_rules = {'index:index:home': ['index_home']};
        var data = instance.getCacheTime();
        assert.equal(data, false)
        done();
      })
    })
    it('hit, default cache time', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_rules = {'index:index:index': ['index_home']};
        var data = instance.getCacheTime();
        assert.equal(data, 3600)
        done();
      })
    })
    it('hit, default cache time', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_rules = {'index:index': ['index_home']};
        var data = instance.getCacheTime();
        assert.equal(data, 3600)
        done();
      })
    })
    it('hit, default cache time', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_rules = {'index': ['index_home']};
        var data = instance.getCacheTime();
        assert.equal(data, 3600)
        done();
      })
    })
    it('hit, default cache time', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_rules = {'*': ['index_home']};
        var data = instance.getCacheTime();
        assert.equal(data, 3600)
        done();
      })
    })
    it('hit, default cache time', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_rules = {'index:index:index': 'index_home'};
        var data = instance.getCacheTime();
        assert.equal(data, 3600)
        done();
      })
    })
    it('hit, define cache time', function(done){
      getInstance().then(function(instance){
        instance.options.html_cache_rules = {'index:index:index': ['index_home', 1000]};
        var data = instance.getCacheTime();
        assert.equal(data, 1000)
        done();
      })
    })
    it('hit, add cookie', function(done){
      getInstance().then(function(instance){
        instance.http.cookie = {name: 'welefen'}
        instance.options.html_cache_rules = {'index:index:index': ['index_home', 1000]};
        var data = instance.getCacheTime();
        assert.equal(data, 1000)
        done();
      })
    })
    it('hit, {:group}', function(done){
      getInstance().then(function(instance){
        instance.http.cookie = {name: 'welefen'}
        instance.options.html_cache_rules = {'index:index:index': ['index_{:group}', 1000]};
        var data = instance.getCacheTime();
        assert.equal(data, 1000)
        done();
      })
    })
    it('hit, {:group1}', function(done){
      getInstance().then(function(instance){
        instance.http.cookie = {name: 'welefen'}
        instance.options.html_cache_rules = {'index:index:index': ['index_{:group1}', 1000]};
        var data = instance.getCacheTime();
        assert.equal(data, 1000)
        done();
      })
    })
    it('hit, callback', function(done){
      getInstance().then(function(instance){
        instance.http.cookie = {name: 'welefen'}
        instance.options.html_cache_rules = {'index:index:index': ['index_{:group}', 1000, function(key){
          assert.equal(key, 'index_index')
        }]};
        var data = instance.getCacheTime();
        assert.equal(data, 1000)
        done();
      })
    })
    it('hit, callback', function(done){
      getInstance().then(function(instance){
        instance.http.cookie = {name: 'welefen'}
        C('html_cache_file_callback', function(key){
          assert.equal(key, 'index_index')
        })
        instance.options.html_cache_rules = {'index:index:index': ['index_{:group}', 1000]};
        var data = instance.getCacheTime();
        assert.equal(data, 1000)
        done();
      })
    })
  })
  describe('getCacheFilename', function(){
    it('getCacheFilename', function(done){
      getInstance().then(function(instance){
        var data = instance.getCacheFilename('welefen');
        assert.equal(data, 'd/0/d044be314c409f92c3ee66f1ed8d3753');
        done();
      })
    })
  })
  describe('checkCacheTime', function(){
    it('file not exist', function(done){
      getInstance().then(function(instance){
        var data = instance.checkCacheTime();
        assert.equal(data, false);
        done();
      })
    })
    it('file exist, is expired', function(done){
      getInstance().then(function(instance){
        var file = instance.options.html_cache_path + '/' + instance.http.html_filename;
        setFileContent(file, 'welefen')
        var data = instance.checkCacheTime(0);
        assert.equal(data, false);
        done();
      })
    })
    it('file exist, not expired', function(done){
      getInstance().then(function(instance){
        var file = instance.options.html_cache_path + '/' + instance.http.html_filename;
        setFileContent(file, 'welefen')
        var data = instance.checkCacheTime(10);
        assert.equal(data, true);
        done();
      })
    })
    it('file exist,tpl file not exist', function(done){
      getInstance().then(function(instance){
        var file = instance.options.html_cache_path + '/' + instance.http.html_filename;
        setFileContent(file, 'welefen');
        var fn = thinkRequire('WriteHtmlCacheBehavior').getViewFile;
        thinkRequire('WriteHtmlCacheBehavior').getViewFile = function(){
          return 'file not exist';
        }
        var data = instance.checkCacheTime(10);
        assert.equal(data, false);
        thinkRequire('WriteHtmlCacheBehavior').getViewFile = fn;
        done();
      })
    })
    it('file exist,tpl file exist', function(done){
      getInstance().then(function(instance){
        var file = instance.options.html_cache_path + '/' + instance.http.html_filename;
        setFileContent(file, 'welefen');
        var fn = thinkRequire('WriteHtmlCacheBehavior').getViewFile;
        thinkRequire('WriteHtmlCacheBehavior').getViewFile = function(){
          setFileContent(__dirname + '/../../App/test.txt', 'welefen')
          return __dirname + '/../../App/test.txt';
        }
        var data = instance.checkCacheTime(10);
        assert.equal(data, true);
        thinkRequire('WriteHtmlCacheBehavior').getViewFile = fn;
        done();
      })
    })
    it('file exist,tpl file exist and newer', function(done){
      getInstance().then(function(instance){
        var file = instance.options.html_cache_path + '/' + instance.http.html_filename;
        setFileContent(file, 'welefen');
        //console.log(file)
        //console.log(fs.statSync(file).mtime.getTime())
        var fn = thinkRequire('WriteHtmlCacheBehavior').getViewFile;
        thinkRequire('WriteHtmlCacheBehavior').getViewFile = function(){
          var file = __dirname + '/../../App/test'+Math.random()+'.txt';
          setFileContent(file, 'welefen');
          //console.log(fs.statSync(file).mtime.getTime())
          return file;
        }
        setTimeout(function(){
          var data = instance.checkCacheTime(10);
          assert.equal(data, false);
          thinkRequire('WriteHtmlCacheBehavior').getViewFile = fn;
          done();
        }, 1000)
      })
    })
  })
});

//删除缓存文件
//异步删除，不能在after里操作
describe('rm tmp files', function(){
  it('rm tmp files', function(done){
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
})