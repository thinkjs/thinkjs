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


describe('middleware/write_html_cache', function(){
  it('off', function(done){
    execMiddleware('write_html_cache', {
      html_cache: {on: false}
    }, {}, 'welefen').then(function(data){
      assert.equal(data, 'welefen');
      done();
    })
  })
  it('not set html_filename', function(done){
    execMiddleware('write_html_cache', {
      html_cache: {on: true}
    }, {}, 'welefen').then(function(data){
      assert.equal(data, 'welefen');
      done();
    })
  })
  it('recordViewFile', function(done){
    var filePath = __dirname;
    execMiddleware('write_html_cache', {
      html_cache: {on: true, path: filePath}
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      html_filename: 'test.html',
      tpl_file: 'welefen.test'
    }, 'welefen').then(function(data){
      assert.equal(data, 'welefen');
      var key = 'home/group/detail';
      var value = thinkCache(thinkCache.VIEW, key);
      assert.equal(value, 'welefen.test');
      assert.equal(think.isFile(filePath + '/test.html'), true);
      require('fs').unlinkSync(filePath + '/test.html');
      done();
    })
  })
  it('recordViewFile 1', function(done){
    var filePath = __dirname;
    execMiddleware('write_html_cache', {
      html_cache: {on: true, path: filePath}
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      html_filename: 'welefen/test/xxx/test.html',
      tpl_file: 'welefen.test'
    }, 'welefen').then(function(data){
      assert.equal(data, 'welefen');
      var key = 'home/group/detail';
      var value = thinkCache(thinkCache.VIEW, key);
      assert.equal(value, 'welefen.test');
      assert.equal(think.isFile(filePath + '/welefen/test/xxx/test.html'), true);
      require('fs').unlinkSync(filePath + '/welefen/test/xxx/test.html');
      think.rmdir(filePath + '/welefen')
      done();
    })
  })
})