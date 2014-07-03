var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');

describe('thinkHttp', function(){
  var thinkHttp = thinkRequire('Http');
  it('thinkHttp is function', function(){
    assert.equal(isFunction(thinkHttp), true)
  })
  it('thinkHttp.getDefaultHttp is function', function(){
    assert.equal(isFunction(thinkHttp.getDefaultHttp), true)
  })
  var thinkDefaultHttp = thinkHttp.getDefaultHttp('/welefen/www?name=test');
  describe('thinkDefaultHttp.req', function(){
    it('httpVersion = 1.1', function(){
      assert.equal(thinkDefaultHttp.req.httpVersion, '1.1')
    })
    it('method = GET', function(){
      assert.equal(thinkDefaultHttp.req.method, 'GET')
    })
    it('url', function(){
      assert.equal(thinkDefaultHttp.req.url, '/welefen/www?name=test')
    })
    it('headers', function(){
      assert.equal(JSON.stringify(thinkDefaultHttp.req.headers), '{"host":"127.0.0.1"}')
    })
    it('connection.remoteAddress = 127.0.0.1', function(){
      assert.equal(thinkDefaultHttp.req.connection.remoteAddress, '127.0.0.1')
    })
  })
  describe('thinkDefaultHttp.res', function(){
    var res = thinkDefaultHttp.res;
    it('res.end is function', function(){
      assert.equal(isFunction(res.end), true)
    })
    it('res.write is function', function(){
      assert.equal(isFunction(res.write), true)
    })
    it('res.setHeader is function', function(){
      assert.equal(isFunction(res.setHeader), true)
    })
  })
})

describe('Http', function(){
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
  var instance = Http(req, res).run();

  it('http.method', function(done){
    instance.then(function(http){
      assert.equal(http.method, 'GET');
      done();
    })
  })
  it('http.version', function(done){
    instance.then(function(http){
      assert.equal(http.version, '1.1');
      done();
    })
  })
  it('http.contentType', function(done){
    instance.then(function(http){
      assert.equal(http.contentType, '');
      done();
    })
  })
  it('http.headers', function(done){
    instance.then(function(http){
      //console.log(JSON.stringify(http.headers))
      assert.equal(JSON.stringify(http.headers), '{"x-real-ip":"127.0.0.1","x-forwarded-for":"127.0.0.1","host":"meinv.ueapp.com","x-nginx-proxy":"true","connection":"close","cache-control":"max-age=0","accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36","accept-encoding":"gzip,deflate,sdch","accept-language":"zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,nl;q=0.2,zh-TW;q=0.2","cookie":"Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1=1380544681,1381634417,1381637116,1381660395; bdshare_firstime=1398851688467; visit_count=5; thinkjs=qSK6dvvHE1nDqzeMBOnIiw4LlbPdYGMB; Hm_lvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404201763,1404205823,1404219513,1404342531; Hm_lpvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404357406"}');
      done();
    })
  })
  it('http.getHeader("user-agent")', function(done){
    instance.then(function(http){
      assert.equal(http.getHeader('user-agent'), 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36');
      done();
    })
  })
  it('http.getHeader("xxxx")', function(done){
    instance.then(function(http){
      assert.equal(http.getHeader('xxx'), '');
      assert.equal(isString(http.getHeader('xxx')), true);
      done();
    })
  })
  it('http.post', function(done){
    instance.then(function(http){
      assert.equal(JSON.stringify(http.post), '{}');
      done();
    })
  })
  it('http.get', function(done){
    instance.then(function(http){
      //console.log(JSON.stringify(http.get))
      assert.equal(JSON.stringify(http.get), '{"name":"welefen","value":"1111"}');
      done();
    })
  })
  it('http.file', function(done){
    instance.then(function(http){
      assert.equal(JSON.stringify(http.file), '{}');
      done();
    })
  })
  it('http.ip()', function(done){
    instance.then(function(http){
      //console.log(http.ip())
      assert.equal(http.ip(), '127.0.0.1');
      done();
    })
  })
  it('http.cookie', function(done){
    instance.then(function(http){
      //console.log(JSON.stringify(http.cookie));
      assert.equal(JSON.stringify(http.cookie), '{"Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1":"1380544681","bdshare_firstime":"1398851688467","visit_count":"5","thinkjs":"qSK6dvvHE1nDqzeMBOnIiw4LlbPdYGMB","Hm_lvt_3a35dfea7bd1bb657c1ecd619a3c6cdd":"1404201763","Hm_lpvt_3a35dfea7bd1bb657c1ecd619a3c6cdd":"1404357406"}');
      done();
    })
  })
  it('http.pathname', function(done){
    instance.then(function(http){
      //console.log(http.ip())
      assert.equal(http.pathname, '/index/index');
      done();
    })
  })
  it('http.query', function(done){
    instance.then(function(http){
      //console.log(JSON.stringify(http.query))
      assert.equal(JSON.stringify(http.query), '{"name":"welefen","value":"1111"}');
      done();
    })
  })
  it('http.get', function(done){
    instance.then(function(http){
      //console.log(JSON.stringify(http.get))
      assert.equal(JSON.stringify(http.get), '{"name":"welefen","value":"1111"}');
      done();
    })
  })
  it('http.host', function(done){
    instance.then(function(http){
      //console.log(http.host)
      assert.equal(http.host, 'meinv.ueapp.com');
      done();
    })
  })
  it('http.hostname', function(done){
    instance.then(function(http){
      //console.log(http.hostname)
      assert.equal(http.hostname, 'meinv.ueapp.com');
      done();
    })
  })
  it('http.req', function(done){
    instance.then(function(http){
      assert.equal(http.req === req, true);
      done();
    })
  })
})