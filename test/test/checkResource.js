var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');


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

describe('CheckResourceBehavior', function(){
  var httpInstance;
  function getTestPromise(obj){
    return instance.then(function(http){
      for(var name in obj){
        http[name] = obj[name];
      }
      httpInstance = http;
      return B('CheckResource', http);
    })
  }
  it('pathname is empty', function(done){
    getTestPromise({
      pathname: ''
    }).then(function(data){
      assert.strictEqual(data, false);
      done();
    })
  })
  it('pathname is static file', function(done){
    var fn = res.end;
    res.end = function(){
      res.end = fn;
      done();
    }
    getTestPromise({
      pathname: 'resource/js/1.js'
    })
  })
  it('pathname is not static file', function(){
    var fn = res.end;
    res.end = function(){
      res.end = fn;
      assert.strictEqual(res.statusCode, 404);
      done();
    }
    getTestPromise({
      pathname: 'resource/js/1fasdfasf.js'
    });
  })
})