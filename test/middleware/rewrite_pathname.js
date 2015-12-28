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


describe('middleware/rewrite_pathname', function(){
  

  it('rewrite_pathname, empty pathname', function(done){
    getHttp({}, {
      pathname: ''
    }).then(function(http){
      think.middleware('rewrite_pathname', http).then(function(data){
        assert.equal(data, undefined);
        done();
      })
    })
  })
  it('rewrite_pathname, pathname', function(done){
    getHttp({
      pathname_prefix: '',
      pathname_suffix: ''
    }, {
      pathname: 'welefen'
    }).then(function(http){
      think.middleware('rewrite_pathname', http).then(function(data){
        assert.equal(http.pathname, 'welefen');
        done();
      })
    })
  })
  it('rewrite_pathname, pathname, has prefix', function(done){
    getHttp({
      pathname_prefix: '/test',
      pathname_suffix: ''
    }, {
      pathname: '/test/welefen'
    }).then(function(http){
      think.middleware('rewrite_pathname', http).then(function(data){
        assert.equal(http.pathname, '/welefen');
        done();
      })
    })
  })
  it('rewrite_pathname, pathname, has suffix', function(done){
    getHttp({
      pathname_prefix: '',
      pathname_suffix: '.text'
    }, {
      pathname: '/test/welefen.text'
    }).then(function(http){
      think.middleware('rewrite_pathname', http).then(function(data){
        assert.equal(http.pathname, '/test/welefen');
        done();
      })
    })
  })
  it('rewrite_pathname, pathname, has prefix & suffix', function(done){
    getHttp({
      pathname_prefix: '/test/',
      pathname_suffix: '.text'
    }, {
      pathname: '/test/welefen.text'
    }).then(function(http){
      think.middleware('rewrite_pathname', http).then(function(data){
        assert.equal(http.pathname, 'welefen');
        done();
      })
    })
  })

})