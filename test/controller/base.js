var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

for(var filepath in require.cache){
  delete require.cache[filepath];
}
var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();


think.APP_PATH = path.dirname(__dirname) + '/testApp';


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
var Controller = think.lookClass('', 'controller');

function getInstance(options){
  return getHttp().then(function(http){
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return new Controller(http);
  })
}

describe('controller/base.js', function(){
  it('ip', function(done){
    getInstance().then(function(instance){
      var ip = instance.ip();
      assert.equal(ip, '127.0.0.1');
      done();
    })
  })
  it('view', function(done){
    getInstance().then(function(instance){
      var view = instance.view();
      assert.equal(view instanceof think.require('view'), true);
      done();
    })
  })
  it('method', function(done){
    getInstance().then(function(instance){
      var method = instance.method();
      assert.equal(method, 'get');
      done();
    })
  })
  it('isGet', function(done){
    getInstance().then(function(instance){
      var data = instance.isGet();
      assert.equal(data, true);
      done();
    })
  })
  it('isPost', function(done){
    getInstance().then(function(instance){
      var data = instance.isPost();
      assert.equal(data, false);
      done();
    })
  })
  it('isMethod', function(done){
    getInstance().then(function(instance){
      var data = instance.isMethod('get');
      assert.equal(data, true);
      done();
    })
  })
  it('isAjax', function(done){
    getInstance().then(function(instance){
      var data = instance.isAjax();
      assert.equal(data, false);
      done();
    })
  })
  it('isWebSocket', function(done){
    getInstance().then(function(instance){
      var data = instance.isWebSocket();
      assert.equal(data, false);
      done();
    })
  })
  it('isCli', function(done){
    think.cli = false;
    getInstance().then(function(instance){
      var data = instance.isCli();
      assert.equal(data, false);
      done();
    })
  })
  it('isJsonp', function(done){
    getInstance().then(function(instance){
      var data = instance.isJsonp();
      assert.equal(data, false);
      done();
    })
  })
  it('get all get data', function(done){
    getInstance().then(function(instance){
      var data = instance.get();
      assert.deepEqual(data, { test: 'welefen', value: '1111' });
      done();
    })
  })
  it('get item get data', function(done){
    getInstance().then(function(instance){
      var data = instance.get('test');
      assert.deepEqual(data, 'welefen');
      done();
    })
  })
  it('get item get data, empty', function(done){
    getInstance().then(function(instance){
      var data = instance.get('test111');
      assert.deepEqual(data, '');
      done();
    })
  })
  it('get all post data', function(done){
    getInstance().then(function(instance){
      var data = instance.post();
      assert.deepEqual(data, { });
      done();
    })
  })
  it('get all param data', function(done){
    getInstance().then(function(instance){
      var data = instance.param();
      assert.deepEqual(data, { test: 'welefen', value: '1111' });
      done();
    })
  })
  it('get all file data', function(done){
    getInstance().then(function(instance){
      var data = instance.file();
      assert.deepEqual(data, {});
      done();
    })
  })
  it('get all header data', function(done){
    getInstance().then(function(instance){
      var data = instance.header();
      data = Object.keys(data).sort();
      assert.deepEqual(data, [ 'accept', 'accept-encoding', 'accept-language', 'cache-control', 'connection', 'host', 'user-agent', 'x-forwarded-for', 'x-nginx-proxy', 'x-real-ip' ]);
      done();
    })
  })
  it('get usrAgent', function(done){
    getInstance().then(function(instance){
      var data = instance.userAgent();
      assert.deepEqual(data, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36')
      done();
    })
  })
  it('get referrer', function(done){
    getInstance().then(function(instance){
      var data = instance.referrer();
      assert.deepEqual(data, '')
      done();
    })
  })
  it('get referer', function(done){
    getInstance().then(function(instance){
      var data = instance.referer();
      assert.deepEqual(data, '')
      done();
    })
  })
  it('get cookie', function(done){
    getInstance().then(function(instance){
      var data = instance.cookie();
      assert.deepEqual(data, {})
      done();
    })
  })
  it('send time', function(done){
    getInstance().then(function(instance){
      var data = instance.sendTime();
      done();
    })
  })
  it('error', function(done){
    getInstance().then(function(instance){
      var data = instance.error();
      done();
    })
  })
  it('fail', function(done){
    getInstance().then(function(instance){
      var data = instance.fail();
      done();
    })
  })
  it('success', function(done){
    getInstance().then(function(instance){
      var data = instance.success();
      done();
    })
  })
  it('type', function(done){
    getInstance().then(function(instance){
      var data = instance.type();
      done();
    })
  })
  it('end', function(done){
    getInstance().then(function(instance){
      var data = instance.end();
      done();
    })
  })
  it('echo', function(done){
    getInstance().then(function(instance){
      var data = instance.echo();
      done();
    })
  })
  it('deny', function(done){
    getInstance().then(function(instance){
      var data = instance.deny();
      done();
    })
  })
  it('deny 404', function(done){
    getInstance({
      status: function(status){
        assert.equal(status, 404);
      }
    }).then(function(instance){
      var data = instance.deny(404);
      done();
    })
  })
  it('status', function(done){
    getInstance().then(function(instance){
      var data = instance.status();
      done();
    })
  })
  it('json', function(done){
    getInstance().then(function(instance){
      var data = instance.json();
      done();
    })
  })
  it('jsonp', function(done){
    getInstance().then(function(instance){
      var data = instance.jsonp();
      done();
    })
  })
  it('redirect', function(done){
    getInstance().then(function(instance){
      var data = instance.redirect();
      done();
    })
  })
  it('lang', function(done){
    getInstance().then(function(instance){
      var data = instance.lang();
      assert.deepEqual(data, 'zh-CN')
      done();
    })
  })
  it('lang use cookie', function(done){
    getInstance().then(function(instance){
      var data = instance.lang(true);
      assert.deepEqual(data, 'zh-CN')
      done();
    })
  })
  it('lang use cookie', function(done){
    getInstance({
      _cookie: {
        think_lang: 'en'
      }
    }).then(function(instance){
      var data = instance.lang(true);
      assert.deepEqual(data, 'en')
      done();
    })
  })
  it('local, not exist', function(done){
    getInstance().then(function(instance){
      var data = instance.local('welefen');
      assert.deepEqual(data, 'welefen')
      done();
    })
  })
  it('local', function(done){
    getInstance({
      _config: think.config()
    }).then(function(instance){
      var data = instance.local('CONTROLLER_NOT_FOUND');
      assert.deepEqual(data, 'controller `%s` not found. url is `%s`.')
      done();
    })
  })
  it('local', function(done){
    getInstance({
      _cookie: {
        think_lang: 'dddd'
      },
      _config: think.config()
    }).then(function(instance){
      var data = instance.local('CONTROLLER_NOT_FOUND');
      assert.deepEqual(data, 'controller `%s` not found. url is `%s`.')
      done();
    })
  })
  it('fetch', function(done){
    getInstance({
    }).then(function(instance){
      return instance.fetch(__filename)
    }).then(function(content){
      assert.equal(content.indexOf('describe') > -1, true);
      done();
    })
  })
  it('display', function(done){
    getInstance({
    }).then(function(instance){
      return instance.display(__filename)
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })
  it('download', function(done){
    getInstance({
      header: function(type, value){
        if(type === 'Content-Type'){
          assert.equal(value, 'application/javascript; charset=utf-8')
        }else{
          assert.equal(value, 'attachment; filename="base.js"')
        }
      }
    }).then(function(instance){
      return instance.download(__filename)
    }).then(function(content){
      assert.equal(content, __filename);
      done();
    })
  })
  it('download, with content-type', function(done){
    getInstance({
      header: function(type, value){
        if(type === 'Content-Type'){
          assert.equal(value, 'text/html; charset=utf-8')
        }else{
          assert.equal(value, 'attachment; filename="base.js"')
        }
      }
    }).then(function(instance){
      return instance.download(__filename, 'text/html')
    }).then(function(content){
      assert.equal(content, __filename);
      done();
    })
  })
  it('download, with content-type, with filename', function(done){
    getInstance({
      header: function(type, value){
        if(type === 'Content-Type'){
          assert.equal(value, 'text/html; charset=utf-8')
        }else{
          assert.equal(value, 'attachment; filename="a.html"')
        }
      }
    }).then(function(instance){
      return instance.download(__filename, 'text/html', 'a.html')
    }).then(function(content){
      assert.equal(content, __filename);
      done();
    })
  })
  it('download,  with filename', function(done){
    getInstance({
      header: function(type, value){
        if(type === 'Content-Type'){
          assert.equal(value, 'application/javascript; charset=utf-8')
        }else{
          assert.equal(value, 'attachment; filename="a.html"')
        }
      }
    }).then(function(instance){
      return instance.download(__filename, 'a.html')
    }).then(function(content){
      assert.equal(content, __filename);
      done();
    })
  })

  it('token', function(done){
    getInstance({
    }).then(function(instance){
      return instance.token()
    }).then(function(data){
      assert.equal(data.length, 32);
      done();
    })
  })
  it('token twice', function(done){
    var d, ins;
    getInstance({
    }).then(function(instance){
      ins = instance;
      return instance.token()
    }).then(function(data){
      d = data;
      return ins.token();
    }).then(function(data){
      assert.equal(data, d);
      done();
    })
  })
  it('token twice', function(done){
    var ins;
    getInstance({
    }).then(function(instance){
      ins = instance;
      return instance.token()
    }).then(function(data){
      return ins.token(data);
    }).then(function(data){
      assert.equal(data, true);
      done();
    })
  })
  it('get session', function(){
    getInstance({
    }).then(function(instance){
      return instance.session('welefen')
    }).then(function(data){
      assert.equal(data, undefined)
      done();
    })
  })
  it('set session', function(){
    var ins;
    getInstance({
    }).then(function(instance){
      ins = instance;
      return ins.session('welefen', 'suredy')
    }).then(function(){
      return ins.session('welefen');
    }).then(function(data){
      assert.equal(data, 'suredy')
      done();
    })
  })
  it('delete session', function(){
    var ins;
    getInstance({
    }).then(function(instance){
      ins = instance;
      return ins.session('welefen', 'suredy')
    }).then(function(){
      return ins.session();
    }).then(function(){
      return ins.session('welefen');
    }).then(function(data){
      assert.equal(data, undefined)
      done();
    })
  })

})