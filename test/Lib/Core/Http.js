var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var Socket = require('net').Socket;
var IncomingMessage = require('http').IncomingMessage;


global.APP_PATH = path.normalize(__dirname + '/../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));


var Http = thinkRequire('Http');
describe('Http', function(){
  describe('getDefaultHttp', function(){
    it('empty data', function(){
      var data = Http.getDefaultHttp();
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"GET","url":"/","headers":{"host":"127.0.0.1"},"connection":{"remoteAddress":"127.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
    it('url data', function(){
      var data = Http.getDefaultHttp('index/index');
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"GET","url":"/index/index","headers":{"host":"127.0.0.1"},"connection":{"remoteAddress":"127.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
    it('url data 1', function(){
      var data = Http.getDefaultHttp('/index/index');
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"GET","url":"/index/index","headers":{"host":"127.0.0.1"},"connection":{"remoteAddress":"127.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
    it('query string', function(){
      var data = Http.getDefaultHttp('url=/index/index&method=cmd');
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"CMD","url":"/index/index","headers":{"host":"127.0.0.1"},"connection":{"remoteAddress":"127.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
    it('query string, host', function(){
      var data = Http.getDefaultHttp('url=/index/index&method=cmd&host=www.welefen.com');
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"CMD","url":"/index/index","headers":{"host":"www.welefen.com"},"connection":{"remoteAddress":"127.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
    it('query string, ip', function(){
      var data = Http.getDefaultHttp('url=/index/index&method=cmd&host=www.welefen.com&ip=10.0.0.1');
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"CMD","url":"/index/index","headers":{"host":"www.welefen.com"},"connection":{"remoteAddress":"10.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
    it('json string', function(){
      var data = Http.getDefaultHttp('{"method": "cmd", "url": "index/index"}');
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"CMD","url":"/index/index","headers":{"host":"127.0.0.1"},"connection":{"remoteAddress":"127.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
    it('json string,headers', function(){
      var data = Http.getDefaultHttp('{"method": "cmd", "url": "index/index", "headers": {"user-agent": "chrome"}}');
      var empty = Http.empty;
      assert.deepEqual(data, {"req":{"httpVersion":"1.1","method":"CMD","url":"/index/index","headers":{"host":"127.0.0.1", "user-agent": "chrome"},"connection":{"remoteAddress":"127.0.0.1"}},"res":{"end": empty,"write": empty,"setHeader": empty}})
    })
  })
  describe('empty', function(){
    it('empty', function(){
      assert.deepEqual(Http.empty("welefen"), "welefen")
    })
  })
  describe('HTTP GET', function(){
    var defaultHttp = Http.getDefaultHttp('/index/index?name=welefen');
    it('is EventEmitter instance', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        assert.equal(http instanceof EventEmitter, true);
        done();
      })
    })
    it('get, query', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        assert.deepEqual(http.get, { name: 'welefen' });
        // assert.deepEqual(http.headers, { host: '127.0.0.1' });
        done();
      })
    })
    it('headers', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        //assert.deepEqual(http.get, { name: 'welefen' });
        assert.deepEqual(http.headers, { host: '127.0.0.1' });
        done();
      })
    })
    it('getHeader', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        //assert.deepEqual(http.get, { name: 'welefen' });
        assert.deepEqual(http.getHeader('user-agent'), '');
        done();
      })
    })
    it('ip', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        //assert.deepEqual(http.get, { name: 'welefen' });
        assert.deepEqual(http.ip(), '127.0.0.1');
        done();
      })
    })
    it('ip with socket', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.req.socket = {remoteAddress: '10.0.0.1'};
        //console.log(http.ip());
        assert.deepEqual(http.ip(), '10.0.0.1');
        done();
      })
    })
    it('ip with connection', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.req.connection = {remoteAddress: '10.0.0.1'};
        //console.log(http.ip());
        assert.deepEqual(http.ip(), '10.0.0.1');
        done();
      })
    })
    it('setHeader', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.setHeader;
        http.res.headersSent = false;
        http.res.setHeader = function(name, value){
          assert.equal(name, 'name');
          assert.equal(value, 'welefen');
          http.res.setHeader = fn;
          done();
        }
        http.setHeader('name', 'welefen');
      })
    })
    it('setHeader, headersSent', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.res.headersSent = true;
        http.setHeader('name', 'welefen');
        done();
      })
    })
    it('setCookie', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.setCookie('name', 'welefen');
        //console.log(http._cookie)
        assert.deepEqual(http._cookie, { name: { path: '/', domain: '', name: 'name', value: 'welefen' } })
        done();
      })
    })
    it('setCookie with timeout', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.setCookie('name', 'welefen', 10000);
        //console.log(http._cookie)
        assert.equal(http._cookie.name.expires !== undefined, true);
        assert.equal(http._cookie.name.expires instanceof Date, true)
        done();
      })
    })
    it('setCookie with timeout 1', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var opts = {timeout: 20000};
        http.setCookie('name', 'welefen', opts);
        http.setCookie('name', 'welefen', opts);
        //console.log(http._cookie)
        assert.equal(http._cookie.name.expires !== undefined, true);
        assert.equal(http._cookie.name.timeout, 20000);
        assert.equal(http._cookie.name.expires instanceof Date, true)
        done();
      })
    })
    it('setCookie, remove cookie', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.setCookie('name', null);
        //console.log(http._cookie)
        assert.equal(http._cookie.name.expires !== undefined, true);
        assert.equal(http._cookie.name.expires instanceof Date, true)
        done();
      })
    })
    it('setCookie, with options', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.setCookie('name', 'welefen', {path: '/xxx/', Domain: 'welefen.com'});
        assert.deepEqual(http._cookie, {"name":{"path":"/xxx/","domain":"welefen.com","name":"name","value":"welefen"}})
        done();
      })
    })
    it('sendCookie', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.setCookie('name', 'welefen', {path: '/xxx/', Domain: 'welefen.com'});
        var fn = http.res.setHeader;
        http.res.headersSent = false;
        http.res.setHeader = function(name, value){
          assert.equal(name, 'Set-Cookie');
          assert.deepEqual(value, [ 'name=welefen; Domain=welefen.com; Path=/xxx/' ])
          assert.deepEqual(http._cookie, {"name":{"path":"/xxx/","domain":"welefen.com","name":"name","value":"welefen"}})
          done();
        }
        http.sendCookie();
      })
    })
    it('sendCookie empty', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.sendCookie();
        done();
      })
    })
    it('sendCookie multi', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        http.setCookie('name', 'welefen', {path: '/xxx/', Domain: 'welefen.com'});
        http.setCookie('value', 'suredy');
        var fn = http.res.setHeader;
        http.res.headersSent = false;
        http.res.setHeader = function(name, value){
          assert.equal(name, 'Set-Cookie');
          //console.log(value)
          assert.deepEqual(value, [ 'name=welefen; Domain=welefen.com; Path=/xxx/', 'value=suredy; Path=/' ]);
          //console.log(http._cookie)
          assert.deepEqual(http._cookie, {"name":{"path":"/xxx/","domain":"welefen.com","name":"name","value":"welefen"},"value":{"path":"/","domain":"","name":"value","value":"suredy"}})
          done();
        }
        http.sendCookie();
      })
    })
    it('redirect empty', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.setHeader;
        http.res.setHeader = function(name, value){
          assert.equal(name, 'Location');
          assert.equal(value, '/');
          http.res.setHeader = fn;
        }
        var fn1 = http.res.end;
        http.res.end = function(){
          http.res.end = fn1;
          done();
        }
        http.redirect();
        assert.equal(http.res.statusCode, 302);
      })
    })
    it('redirect url', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.setHeader;
        http.res.setHeader = function(name, value){
          assert.equal(name, 'Location');
          assert.equal(value, 'http://www.welefen.com');
          http.res.setHeader = fn;
        }
        var fn1 = http.res.end;
        http.res.end = function(){
          http.res.end = fn1;
          done();
        }
        http.redirect('http://www.welefen.com', 301);
        assert.equal(http.res.statusCode, 301);
      })
    })
    it('sendTime empty', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.setHeader;
        http.res.setHeader = function(name, value){
          assert.equal(name, 'X-EXEC-TIME');
          http.res.setHeader = fn;
          done();
        }
        http.sendTime();
      })
    })
    it('sendTime name', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.setHeader;
        http.res.setHeader = function(name, value){
          assert.equal(name, 'X-TEST');
          http.res.setHeader = fn;
          done();
        }
        http.sendTime('TEST');
      })
    })
    it('echo empty', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        assert.equal(http.echo(), undefined);
        done();
      })
    })
    it('echo array', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.write;
        http.res.write = function(content){
          //console.log(content)
          assert.equal(content, "[1,2,3]")
          done();
        }
        http.echo([1,2,3])
      })
    })
    it('echo obj', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.write;
        http.res.write = function(content){
          //console.log(content)
          assert.equal(content, '{"name":"welefen"}')
          done();
        }
        http.echo({name:'welefen'})
      })
    })
    it('echo str', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.write;
        http.res.write = function(content){
          //console.log(content)
          assert.equal(content, 'welefen')
          done();
        }
        http.echo('welefen')
      })
    })
    it('echo str', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.write;
        var buffer = new Buffer(10)
        http.res.write = function(content){
          //console.log(content)
          assert.equal(content, buffer)
          done();
        }
        http.echo(buffer)
      })
    })
    it('echo true', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.write;
        http.res.write = function(content){
          //console.log(content)
          assert.equal(content, 'true')
          done();
        }
        http.echo(true)
      })
    })
    it('echo no encoding', function(done){
      Http(defaultHttp.req, defaultHttp.res).run().then(function(http){
        var fn = http.res.write;
        http.res.write = function(content, encoding){
          //console.log(content)
          assert.equal(content, 'true')
          done();
        }
        http.echo(true)
      })
    })

  })

  describe('HTTP POST', function(){
    var defaultHttp = Http.getDefaultHttp('url=/index/index&method=post');
    it('hasPostData false', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      //console.log(instance.hasPostData()===false)
      assert.equal(instance.hasPostData(), false);
      done();
    })
    it('hasPostData true', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance._request();
      instance._response();
      instance.http.req.headers['transfer-encoding'] = 'GZIP';
      assert.equal(instance.hasPostData(), true);
      done();
    })
    it('hasPostData true', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance._request();
      instance._response();
      delete instance.http.req.headers['transfer-encoding'];
      instance.http.req.headers['content-length'] = 100;
      assert.equal(instance.hasPostData(), true);
      done();
    })
    it('common post, no data', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new (require('http').IncomingMessage);
      //instance.req.headers = {'transfer-encoding': 'gzip'}
      instance.req.method = 'POST';
      instance.run().then(function(http){
        done();
      });
    })
    it('common post with data', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip'}
      instance.req.method = 'POST'
      process.nextTick(function(){
        instance.req.emit('data', new Buffer('name=welefen'))
        instance.req.emit('end');
      })
      instance.run().then(function(http){
        assert.deepEqual(http.post, { name: 'welefen' })
        done();
      });
    })
    it('common post with data1', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip'}
      instance.req.method = 'POST'
      process.nextTick(function(){
        instance.req.emit('data', new Buffer('name=welefen&value=suredy'))
        instance.req.emit('end');
      })
      instance.run().then(function(http){
        assert.deepEqual(http.post, { name: 'welefen', value: 'suredy' })
        done();
      });
    })
    it('common post with ajax data', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip', 'x-filename': '1.js'}
      instance.req.method = 'POST';
      process.nextTick(function(){
        instance.req.emit('data', new Buffer('name=welefen&value=suredy'))
        instance.req.emit('end');
      })
      instance.run().then(function(http){
        var file = http.file.file;
        assert.equal(file.originalFilename, '1.js');
        assert.equal(file.size, 25);
        assert.equal(file.path.indexOf('.js') > -1, true);
        done();
      });
    })
    it('common post_max_fields', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip'}
      instance.req.method = 'POST';
      process.nextTick(function(){
        var arr = [];
        for(var i=0;i<100;i++){
          arr.push(Math.random() + '=' + Date.now());
        }
        instance.req.emit('data', new Buffer(arr.join('&')))
        instance.req.emit('end');
      })
      C('post_max_fields', 50);
      var fn = instance.res.end;
      instance.res.statusCode = 200;
      instance.res.end = function(){
        assert.equal(instance.res.statusCode, 413);
        instance.res.end = fn;
        done();
      }
      instance.run();
    })
    it('common post_max_fields_size', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip'}
      instance.req.method = 'POST';
      process.nextTick(function(){
        var arr = [];
        for(var i=0;i<40;i++){
          arr.push(Math.random() + '=' + (new Array(1000).join(Math.random() +　'')));
        }
        instance.req.emit('data', new Buffer(arr.join('&')))
        instance.req.emit('end');
      })
      C('post_max_fields', 50);
      C('post_max_fields_size', 1000)
      var fn = instance.res.end;
      instance.res.statusCode = 200;
      instance.res.end = function(){
        assert.equal(instance.res.statusCode, 413);
        instance.res.end = fn;
        done();
      }
      instance.run();
    })
    it('file upload', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip', 'content-type': 'multipart/form-data; boundary=welefen'}
      instance.req.method = 'POST';
      process.nextTick(function(){
        instance.form.emit('file', 'image', 'welefen');
        instance.form.emit('close');
      })
      C('post_max_fields', 150);
      C('post_max_fields_size', 1000)
      instance.run().then(function(http){
        assert.deepEqual(http.file, { image: 'welefen' });
        done();
      })
    })
    it('file upload, filed', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip', 'content-type': 'multipart/form-data; boundary=welefen'}
      instance.req.method = 'POST';
      process.nextTick(function(){
        instance.form.emit('field', 'image', 'welefen');
        instance.form.emit('close');
      })
      C('post_max_fields', 150);
      C('post_max_fields_size', 1000)
      instance.run().then(function(http){
        assert.deepEqual(http.post, { image: 'welefen' });
        done();
      })
    })
    it('file upload, error', function(done){
      var instance = Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.headers = {'transfer-encoding': 'gzip', 'content-type': 'multipart/form-data; boundary=welefen'}
      instance.req.method = 'POST';
      instance.res.statusCode = 200;
      process.nextTick(function(){
        instance.form.emit('error', new Error('test'));
      })
      C('post_max_fields', 150);
      C('post_max_fields_size', 1000)
      instance.run();
      instance.res.end = function(){
        assert.equal(instance.res.statusCode, 413)
        done();
      }
    })



  })

})