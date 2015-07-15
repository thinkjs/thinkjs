var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');

var _http = require('../_http.js');

function execMiddleware(middleware, config){
  return think.http(_http.req, _http.res).then(function(http){
    if(config){
      http._config = config;
    }
    return think.middleware(middleware, http);
  })
}


describe('middleware/deny_ip', function(){
  before(function(){
    var Index = require('../../lib/index.js');
    var instance = new Index();
    instance.load();
  })
  it('deny_ip undefined', function(done){
    execMiddleware('deny_ip').then(function(data){
      assert.equal(data, true);
      done();
    })
  })
  it('deny_ip empty array', function(done){
    execMiddleware('deny_ip', {
      deny_ip: []
    }).then(function(data){
      assert.equal(data, true);
      done();
    })
  })
  it('deny_ip function', function(done){
    execMiddleware('deny_ip', {
      deny_ip: function(){return []}
    }).then(function(data){
      assert.equal(data, true);
      done();
    })
  })
  it('deny_ip 10.0.0.1', function(done){
    execMiddleware('deny_ip', {
      deny_ip: ['10.0.0.1']
    }).then(function(data){
      assert.equal(data, true);
      done();
    })
  })
  it('deny_ip 127.0.0.1', function(done){
    execMiddleware('deny_ip', {
      deny_ip: ['127.0.0.1']
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })
  it('deny_ip *', function(done){
    execMiddleware('deny_ip', {
      deny_ip: ['*']
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })
  it('deny_ip 127.0.0.*', function(done){
    execMiddleware('deny_ip', {
      deny_ip: ['127.0.0.*']
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })
  it('deny_ip 127.*.0.*', function(done){
    execMiddleware('deny_ip', {
      deny_ip: ['127.*.0.*']
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })
  it('deny_ip 10.0.0.1,127.*.0.*', function(done){
    execMiddleware('deny_ip', {
      deny_ip: ['10.0.0.1', '127.*.0.*']
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })
  it('deny_ip 10.0.0.1,192.168.1.1', function(done){
    execMiddleware('deny_ip', {
      deny_ip: ['10.0.0.1', '192.168.1.1']
    }).then(function(data){
      assert.equal(data, true);
      done();
    })
  })
})