var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');

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
  'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,nl;q=0.2,zh-TW;q=0.2'
};
req.method = 'GET';
req.httpVersion = '1.1';
req.url = '/index/index/name/welefen?test=welefen&value=1111';
var res = new http.ServerResponse(req);
var instance = Http(req, res).run();

describe('TokenBehavior', function(){
  var httpInstance;
  function getTestPromise(obj, content){
    return instance.then(function(http){
      obj = obj || {};
      for(var name in obj){
        http[name] = obj[name];
      }
      httpInstance = http;
      return B('Token', http, content);
    })
  }
  it('token', function(done){
    getTestPromise({}, 'welefen').then(function(content){
      assert.equal(content, 'welefen');
      done();
    })
  })
  it('token on, no replace', function(done){
    C('token_on', true);
    getTestPromise({}, 'welefen').then(function(content){
      assert.equal(content, 'welefen');
      done();
    })
  })
  it('token on, __TOKEN__', function(done){
    C('token_on', true);
    getTestPromise({}, 'welefen{__TOKEN__}').then(function(content){
      assert.equal(content.length, 39);
      done();
    })
  })
  it('token on, </form>', function(done){
    C('token_on', true);
    getTestPromise({}, 'welefen</form>').then(function(content){
      assert.equal(content.indexOf('<input type="hidden" name="token"') > -1, true);
      done();
    })
  })
  it('token on, </head>', function(done){
    C('token_on', true);
    getTestPromise({}, 'welefen</head>').then(function(content){
      assert.equal(content.indexOf('<meta name="token"') > -1, true);
      done();
    })
  })
})