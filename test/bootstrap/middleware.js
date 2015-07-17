var assert = require('assert');
var muk = require('muk');
var path = require('path');

var _http = require('../_http.js');

function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + '/testApp';
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


describe('bootstrap/middleware.js', function(){
  it('parse_json_payload empty', function(done){
    getHttp({}, {
      payload: ''
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_json_payload, empty content-type', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: 'welefen',
      contentType: ''
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_json_payload, has content-type', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: 'welefen',
      
      contentType: 'application/json'
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_json_payload, has payload', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),
      
      contentType: 'application/json'
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {name: 'welefen', test: 'haha'});
        done();
      })
    })
  })
  it('output_resource', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),
      
      contentType: 'application/json'
    }).then(function(http){
      think.middleware('output_resource', http, __filename).then(function(data){
        assert.equal(data, __filename);
        done();
      })
    })
  })
  it('output_resource file not exist', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),
      
      contentType: 'application/json'
    }).then(function(http){
      think.middleware('output_resource', http, __filename + '_____').catch(function(err){
        assert.equal(think.isError(err), true);
        done();
      })
    })
  })
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
  it('send_error, prevent error', function(done){
    getHttp({
      
    }, {}).then(function(http){
      think.middleware('send_error', http, new Error('PREVENT_NEXT_PROCESS')).then(function(data){
        assert.equal(data, undefined);
        done();
      })
    })
  })
  it('send_error, cli', function(done){
    getHttp({
      error: {
        log: false
      }
    }, {
      cli: true
    }).then(function(http){
      think.middleware('send_error', http, new Error('welefen')).then(function(data){
        assert.equal(data, undefined);
        done();
      })
    })
  })
  it('send_error, cli', function(done){
    var log = think.log;
    think.log = function(err){
      assert.equal(err.message, 'welefen')
    }
    getHttp({
      error: {
        log: true
      }
    }, {
      cli: false
    }).then(function(http){
      think.middleware('send_error', http, new Error('welefen')).then(function(data){
        assert.equal(data, undefined);
        think.log = log;
        done();
      })
    })
  })
  it('send_error, is ajax', function(done){
    var cli = think.cli;
    think.cli = false;
    getHttp({
      error: {
        log: false
      }
    }, {
      cli: false
    }).then(function(http){
      http.isAjax = function(){
        return true;
      }
      http.fail = function(code, msg){
        assert.equal(code, 500);
        assert.equal(msg, 'welefen')
      }
      think.middleware('send_error', http, new Error('welefen')).then(function(data){
        assert.equal(data, undefined);
        think.cli = cli;
        done();
      })
    })
  })
  it('send_error, is ajax, detail', function(done){
    var cli = think.cli;
    think.cli = false;
    getHttp({
      error: {
        log: false,
        detail: true
      }
    }, {
      cli: false
    }).then(function(http){
      http.isAjax = function(){
        return true;
      }
      http.fail = function(code, msg){
        assert.equal(code, 500);
        assert.equal(msg.indexOf('Error: welefen') > -1, true)
      }
      think.middleware('send_error', http, new Error('welefen')).then(function(data){
        assert.equal(data, undefined);
        think.cli = cli;
        done();
      })
    })
  })
  it('send_error, is ajax, detail', function(done){
    var cli = think.cli;
    think.cli = false;
    getHttp({
      error: {
        log: false,
        detail: true
      }
    }, {
      cli: false
    }).then(function(http){
      http.isAjax = function(){
        return true;
      }
      http.fail = function(code, msg){
        assert.equal(code, 500);
        assert.equal(msg, 'welefen')
      }
      think.middleware('send_error', http, 'welefen').then(function(data){
        assert.equal(data, undefined);
        think.cli = cli;
        done();
      })
    })
  })
  it('send_error, is jsonp, detail', function(done){
    var cli = think.cli;
    think.cli = false;
    getHttp({
      error: {
        log: false,
        detail: true,
        key: 'errno',
        msg: 'errmsg'
      }
    }, {
      cli: false
    }).then(function(http){
      http.isAjax = function(){
        return false;
      }
      http.isJsonp = function(){
        return true;
      }
      http.jsonp = function(data){
        assert.deepEqual(data, { errno: 500, errmsg: 'welefen' })
      }
      think.middleware('send_error', http, 'welefen').then(function(data){
        assert.equal(data, undefined);
        think.cli = cli;
        done();
      })
    })
  })
  it('send_error, template, detail', function(done){
    var cli = think.cli;
    think.cli = false;
    getHttp({
      error: {
        log: false,
        detail: true,
        key: 'errno',
        msg: 'errmsg'
      }
    }, {
      cli: false
    }).then(function(http){
      http.isAjax = function(){
        return false;
      }
      http.isJsonp = function(){
        return false;
      }
      http.end = function(msg){
        assert.equal(msg, '<pre style="font-size:14px;line-height:20px;">welefen</pre>')
      }
      
      think.middleware('send_error', http, 'welefen').then(function(data){
        think.cli = cli;
        done();
      })
    })
  })
  it('send_error, resource output', function(done){
    var cli = think.cli;
    think.cli = false;
    getHttp({
      error: {
        log: false,
        detail: false,
        key: 'errno',
        msg: 'errmsg',
        file: __filename
      }
    }, {
      cli: false
    }).then(function(http){
      http.isAjax = function(){
        return false;
      }
      http.isJsonp = function(){
        return false;
      }
      
      think.middleware('send_error', http, 'welefen').then(function(data){
        assert.equal(data, __filename)
        think.cli = cli;
        done();
      })
    })
  })




})