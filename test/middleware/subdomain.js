var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var _http = require('../_http.js');

function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';
  var req = think.extend({}, _http.req);
  var res = think.extend({}, _http.res);
  return think.http(req, res).then(function(http){
    if(config){
      http._config = config;
    }
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return http;
  })
}

function execMiddleware(middleware, config, options, data){
  return getHttp(config, options).then(function(http){
    return think.middleware(middleware, http, data);
  }) 
}


describe('middleware/subdomain', function(){
  it('subdomain_deploy, subdomain emtpy', function(done){
    getHttp({
      subdomain: {},
    }, {
      pathname: '/test/welefen.text'
    }).then(function(http){
      think.middleware('subdomain_deploy', http).then(function(data){
        assert.equal(http.pathname, '/test/welefen.text');
        done();
      })
    })
  })
   it('subdomain_deploy, subdomain', function(done){
    getHttp({
      subdomain: {
        test: 'test'
      },
    }, {
      hostname: 'www.thinkjs.org',
      pathname: '/test/welefen.text'
    }).then(function(http){
      think.middleware('subdomain_deploy', http).then(function(data){
        assert.equal(http.pathname, '/test/welefen.text');
        done();
      })
    })
  })
  it('subdomain_deploy, subdomain 1', function(done){
    getHttp({
      subdomain: {
        test: 'test'
      },
    }, {
      hostname: 'test.thinkjs.org',
      pathname: 'welefen.text'
    }).then(function(http){
      think.middleware('subdomain_deploy', http).then(function(data){
        assert.equal(http.pathname, 'test/welefen.text');
        done();
      })
    })
  })
})