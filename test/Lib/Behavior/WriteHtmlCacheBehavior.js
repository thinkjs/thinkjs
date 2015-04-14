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
res.write = function(){
  return true;
}
var instance = Http(req, res).run();
describe('WriteHtmlCacheBehavior', function(){
  var httpInstance;
  function getTestPromise(content){
    return instance.then(function(http){
      httpInstance = http;
      http.group = 'Index';
      http.controller = 'Index';
      http.action = 'index'
      return B('WriteHtmlCache', http, content);
    })
  }
  function getInstance(){
    return instance.then(function(http){
      httpInstance = http;
      http.group = 'Index';
      http.controller = 'Index';
      http.action = 'index'
      return thinkRequire('WriteHtmlCacheBehavior');
    })
  }
  describe('run', function(){
    it('disable html cache', function(done){
      C('html_cache_on', false)
      getTestPromise('').then(function(data){
        assert.equal(data, '')
        done();
      })
    })
    it('empty html filename', function(done){
      C('html_cache_on', true)
      getTestPromise('').then(function(data){
        assert.equal(data, '')
        done();
      })
    })
    it('html filename', function(done){
      C('html_cache_on', true);
      httpInstance.html_filename = 'test.html';
      getTestPromise('welefen').then(function(data){
        assert.equal(data, 'welefen')
        setTimeout(function(){
          var file = C('html_cache_path') + '/test.html';
          var content = getFileContent(file);
          assert.equal(content, 'welefen');
          done();
        }, 200)
      })
    })
  })
  describe('getViewFile', function(){
    it('getViewFile', function(done){
      getInstance().then(function(ins){
        ins.getViewFile(httpInstance);
        done();
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