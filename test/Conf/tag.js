var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');

global.APP_PATH = path.normalize(__dirname + '/../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../index.js'));


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


describe('Tag', function(){
  it('tag list', function(done){
    instance.then(function(http){
      var tags = C('tag');
      var tagKeys = Object.keys(tags);
      [
        'app_init','form_parse','path_info','resource_check',
        'resource_output','route_check','app_begin','action_init',
        'view_init','view_template','view_parse','view_filter',
        'view_end','action_end','app_end','content_write'
      ].forEach(function(item){
        assert.equal(tagKeys.indexOf(item) > -1, true);
      })
      done();
    })
  })
  it('closeDbConnect', function(done){
    instance.then(function(http){
      var closeDbConnect = C('tag').app_end[0];
      closeDbConnect();
      C('auto_close_db', true);
      closeDbConnect();
      C('auto_close_db', false)
      done();
    })
  })
  describe('jsonParse', function(){
    it('jsonParse empty', function(done){
      instance.then(function(http){
        var jsonParse = C('tag').form_parse[0];
        jsonParse(http);
        assert.deepEqual(http.post, {})
        done();
      })
    })
    it('jsonParse post_json_content_type is string', function(done){
      instance.then(function(http){
        var type = C('post_json_content_type');
        C('post_json_content_type', 'application/json')
        var jsonParse = C('tag').form_parse[0];
        jsonParse(http);
        assert.deepEqual(http.post, {})
        C('post_json_content_type', type)
        done();
      })
    })
    it('jsonParse payload empty', function(done){
      instance.then(function(http){
        http.contentType = 'application/json';
        http.payload = '';
        var jsonParse = C('tag').form_parse[0];
        jsonParse(http);
        assert.deepEqual(http.post, {})
        done();
      })
    })
    it('jsonParse payload has data', function(done){
      instance.then(function(http){
        http.contentType = 'application/json';
        http.payload = '{"name":"welefen"}';
        var jsonParse = C('tag').form_parse[0];
        jsonParse(http)
        //console.log(http.post)
        assert.deepEqual(http.post, {name: 'welefen'})
        done();
      })
    })
    it('jsonParse payload error data', function(done){
      instance.then(function(http){
        http.contentType = 'application/json';
        http.payload = '{name:"welefen"}';
        http.post = {};
        var jsonParse = C('tag').form_parse[0];
        jsonParse(http)
        //console.log(http.post)
        assert.deepEqual(http.post, {})
        done();
      })
    })
  })
  describe('resourceOutput', function(){
    it('resourceOutput', function(done){
      instance.then(function(http){
        var resourceOutput = C('tag').resource_output[0];
        var flag = false;
        http.res.end = function(){
           if (!flag) {
            flag = true;
            done();
           }
        }
        resourceOutput(http, __filename);
      })
    })
  })
})