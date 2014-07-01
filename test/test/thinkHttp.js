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
