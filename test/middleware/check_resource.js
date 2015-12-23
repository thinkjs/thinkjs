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

describe('middleware/check_resource', function(){
  // it('base, RESOURCE_PATH not set', function(done){
  //   var RESOURCE_PATH = think.RESOURCE_PATH;
  //   think.RESOURCE_PATH = '';
  //   execMiddleware('check_resource', {}, {}).then(function(data){
  //     assert.equal(data, false);
  //     think.RESOURCE_PATH = RESOURCE_PATH;
  //     done();
  //   })
  // })
  it('base, resource_on off', function(done){
    execMiddleware('check_resource', {
      resource_on: false
    }, {}).then(function(data){
      assert.equal(data, null);
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('base, pathname empty', function(done){
    execMiddleware('check_resource', {
      resource_on: true
    }, {
      pathname: ''
    }).then(function(data){
      assert.equal(data, null);
      done();
    })
  })
  it('base, reg not match', function(done){
    execMiddleware('check_resource', {
      resource_on: true,
      resource_reg: /^\d+$/
    }, {
      pathname: 'wwww'
    }).then(function(data){
      assert.equal(data, null);
      done();
    })
  })
  it('base, file not found', function(done){
    execMiddleware('check_resource', {
      resource_on: true,
      resource_reg: /^\d+$/
    }, {
      pathname: '01111'
    }).then(function(data){
      assert.equal(data, true);
      done();
    })
  })
  it('base, file is dir', function(done){
    var RESOURCE_PATH = think.RESOURCE_PATH;
    think.RESOURCE_PATH = path.dirname(__dirname);
    execMiddleware('check_resource', {
      resource_on: true,
      resource_reg: /^\w+$/
    }, {
      pathname: 'middleware'
    }).then(function(data){
      assert.equal(data, true);
      think.RESOURCE_PATH = RESOURCE_PATH;
      done();
    })
  })
  it('base, file exist', function(done){
    var RESOURCE_PATH = think.RESOURCE_PATH;
    think.RESOURCE_PATH = __dirname;
    execMiddleware('check_resource', {
      resource_on: true,
      resource_reg: /^check_resource\.js/
    }, {
      pathname: 'check_resource.js'
    }).then(function(file){
      assert.equal(file.indexOf('check_resource.js') > -1, true);
      think.RESOURCE_PATH = RESOURCE_PATH;
      done();
    })
  })
})