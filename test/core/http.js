'use strict';

var assert = require('assert');
var path = require('path');
var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;
var Socket = require('net').Socket;
var IncomingMessage = require('http').IncomingMessage;

var thinkjs = require('../../lib/index.js');
new thinkjs().load();


var Http = require('../../lib/core/Http.js');

var localIp = '127.0.0.1';
function noop(data) {
  return data;
}
function getDefaultHttp(data) {
  data = data || {};
  if (think.isString(data)) {
    if (data[0] === '{') {
      data = JSON.parse(data);
    } else if (/^[\w]+\=/.test(data)) {
      data = querystring.parse(data);
    } else {
      data = {
        url: data
      };
    }
  }
  var url = data.url || '';
  if (url.indexOf('/') !== 0) {
    url = '/' + url;
  }
  var req = {
    httpVersion: '1.1',
    method: (data.method || 'GET').toUpperCase(),
    url: url,
    headers: think.extend({
      host: data.host || localIp
    }, data.headers),
    connection: {
      remoteAddress: data.ip || localIp
    }
  };
  var res = {
    end: data.end || data.close || noop,
    write: data.write || data.send || noop,
    setHeader: noop,
    setTimeout: noop,
    connection: {
      remoteAddress: data.ip || localIp
    }
  };
  if (data.params) {
    req.params = data.params;
  }
  return {
    req: req,
    res: res
  };
}

think.APP_PATH = path.dirname(path.dirname(__dirname)) + '/testApp';

describe('core/http.js', function() {
  var defaultHttp = getDefaultHttp('/index/index?name=maxzhang');

  it('is EventEmitter instance', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http instanceof EventEmitter, true);
      done();
    });
  });

  it('get, query', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.get(), { name: 'maxzhang' });
      done();
    });
  });

  it('get headers', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.header(), { host: '127.0.0.1' });
      done();
    });
  });

  it('get special header', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.header('user-agent'), '');
      done();
    });
  });

  it('ip', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.host = '127.0.0.1:8360';
    instance.run().then(function(http) {
      assert.deepEqual(http.ip(), '127.0.0.1');
      done();
    });
  });

  it('ip with socket', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.host = '127.0.0.1:8360';
      http.req.socket = {
        remoteAddress: '10.0.0.1'
      };
      assert.deepEqual(http.ip(), '10.0.0.1');
      done();
    });
  });

  it('ip with connection', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.host = '127.0.0.1:8360';
      http.req.connection = {
        remoteAddress: '10.0.0.1'
      };
      assert.deepEqual(http.ip(), '10.0.0.1');
      done();
    });
  });

  it('ip with ::', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.host = '127.0.0.1:8360';
      http.req.connection = {
        remoteAddress: '::ff:10.0.0.1'
      };
      assert.deepEqual(http.ip(), '10.0.0.1');
      done();
    });
  });

  it('set header', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.headersSent = false;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'name');
        assert.equal(value, 'maxzhang');
        http.res.setHeader = fn;
        done();
      };
      http.header('name', 'maxzhang');
    });
  });

  it('set header, headersSent', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.res.headersSent = true;
      http.header('name', 'maxzhang');
      done();
    });
  });

  it('set cookie', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', 'maxzhang');
      assert.deepEqual(http._sendCookie, {
        'name': {
          'path': '/',
          'domain': '',
          'httponly': false,
          'secure': false,
          'timeout': 0,
          'name': 'name',
          'value': 'maxzhang'
        }
      });
      done();
    });
  });

  it('set cookie with timeout', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', 'maxzhang', 10000);
      assert.equal(http._sendCookie.name.expires !== undefined, true);
      assert.equal(http._sendCookie.name.expires instanceof Date, true);
      done();
    });
  });

  it('set cookie with timeout 1', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var opts = {
        timeout: 20000
      };
      http.cookie('name', 'maxzhang', opts);
      http.cookie('name', 'maxzhang', opts);
      assert.equal(http._sendCookie.name.expires !== undefined, true);
      assert.equal(http._sendCookie.name.timeout, 20000);
      assert.equal(http._sendCookie.name.expires instanceof Date, true);
      done();
    });
  });

  it('set cookie, remove cookie', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', null);
      assert.equal(http._sendCookie.name.expires !== undefined, true);
      assert.equal(http._sendCookie.name.expires instanceof Date, true);
      done();
    });
  });

  it('set cookie, with options', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', 'maxzhang', {
        'path': '/xxx/',
        'domain': 'thinkjs.org'
      });
      assert.deepEqual(http._sendCookie, {
        'name': {
          'path': '/xxx/',
          'domain': 'thinkjs.org',
          'httponly': false,
          'secure': false,
          'timeout': 0,
          'name': 'name',
          'value': 'maxzhang'
        }
      });
      done();
    });
  });

  it('send cookie', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', 'maxzhang', {
        'path': '/xxx/',
        'domain': 'thinkjs.org'
      });
      var fn = http.res.setHeader;
      http.res.headersSent = false;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'Set-Cookie');
        assert.deepEqual(value, ['name=maxzhang; Domain=thinkjs.org; Path=/xxx/']);
        assert.deepEqual(http._sendCookie, {
          'name': {
            'path': '/xxx/',
            'domain': 'thinkjs.org',
            'httponly': false,
            'secure': false,
            'timeout': 0,
            'name': 'name',
            'value': 'maxzhang'
          }
        });
        http.res.setHeader = fn;
        done();
      };
      http.cookie(true);
    });
  });

  it('send cookie empty', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie(true);
      done();
    });
  });

  it('send cookie multi', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', 'maxzhang', {
        'path': '/xxx/',
        'domain': 'thinkjs.org'
      });
      http.cookie('value', 'suredy');
      var fn = http.res.setHeader;
      http.res.headersSent = false;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'Set-Cookie');
        assert.deepEqual(value, ['name=maxzhang; Domain=thinkjs.org; Path=/xxx/', 'value=suredy; Path=/']);
        assert.deepEqual(http._sendCookie, {
          'name': {
            'path': '/xxx/',
            'domain': 'thinkjs.org',
            'httponly': false,
            'secure': false,
            'timeout': 0,
            'name': 'name',
            'value': 'maxzhang'
          },
          'value': {
            'path': '/',
            'domain': '',
            'httponly': false,
            'secure': false,
            'timeout': 0,
            'name': 'value',
            'value': 'suredy'
          }
        });
        http.res.setHeader = fn;
        done();
      };
      http.cookie(true);
    });
  });

  it('redirect empty', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'Location');
        assert.equal(value, '/');
        http.res.setHeader = fn;
      };
      var fn1 = http.res.end;
      http.res.end = function() {
        http.res.end = fn1;
        done();
      };
      http.redirect();
      assert.equal(http.res.statusCode, 302);
    });
  });

  it('redirect url', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'Location');
        assert.equal(value, 'http://www.thinkjs.org');
        http.res.setHeader = fn;
      };
      var fn1 = http.res.end;
      http.res.end = function() {
        http.res.end = fn1;
        done();
      };
      http.redirect('http://www.thinkjs.org', 301);
      assert.equal(http.res.statusCode, 301);
    });
  });

  it('sendTime empty', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'X-EXEC-TIME');
        http.res.setHeader = fn;
        done();
      };
      http.sendTime();
    });
  });

  it('sendTime name', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'X-TEST');
        http.res.setHeader = fn;
        done();
      };
      http.sendTime('TEST');
    });
  });

  it('echo empty', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.echo(), undefined);
      done();
    });
  });

  it('echo array', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '[1,2,3]');
        http.res.write = fn;
        done();
      };
      http.echo([1, 2, 3]);
    });
  });

  it('echo obj', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '{"name":"maxzhang"}');
        http.res.write = fn;
        done();
      };
      http.echo({
        name: 'maxzhang'
      });
    });
  });

  it('echo str', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, 'maxzhang');
        http.res.write = fn;
        done();
      };
      http.echo('maxzhang');
    });
  });

  it('echo str', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      var buffer = new Buffer(10);
      http.res.write = function(content) {
        assert.equal(content, buffer);
        http.res.write = fn;
        done();
      };
      http.echo(buffer);
    });
  });

  it('echo true', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, 'true');
        http.res.write = fn;
        done();
      };
      http.echo(true);
    });
  });

  it('echo no encoding', function(done) {
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content, encoding) {
        assert.equal(content, 'true');
        http.res.write = fn;
        done();
      };
      http.echo(true);
    });
  });


  describe('HTTP POST', function() {
    var defaultHttp = getDefaultHttp('/index/index&method=post');

    it('hasPostData false', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      assert.equal(instance.hasPostData(), false);
      done();
    });

    it('hasPostData true', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.http.req.headers['transfer-encoding'] = 'GZIP';
      assert.equal(instance.hasPostData(), true);
      done();
    });

    it('hasPostData true', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      delete instance.http.req.headers['transfer-encoding'];
      instance.http.req.headers['content-length'] = 100;
      assert.equal(instance.hasPostData(), true);
      done();
    });

    it('common post, no data', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage();
      instance.req.url = defaultHttp.req.url;
      instance.req.method = 'POST';
      instance.run().then(function(http) {
        done();
      });
    });

    it('common post with data', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.req.emit('data', new Buffer('name=maxzhang'));
        instance.req.emit('end');
      });
      instance.run().then(function(http) {
        assert.deepEqual(http.post(), {
          name: 'maxzhang'
        });
        done();
      });
    });

    it('common post with data1', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.req.emit('data', new Buffer('name=maxzhang&value=suredy'));
        instance.req.emit('end');
      });
      instance.run().then(function(http) {
        assert.deepEqual(http.post(), {
          name: 'maxzhang',
          value: 'suredy'
        });
        done();
      });
    });

    it('common post.max_fields', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        var arr = [];
        for (var i = 0; i < 100; i++) {
          arr.push(Math.random() + '=' + Date.now());
        }
        instance.req.emit('data', new Buffer(arr.join('&')));
        instance.req.emit('end');
      });
      think.config('post.max_fields', 50);
      var fn = instance.res.end;
      instance.res.statusCode = 200;
      instance.res.end = function() {
        assert.equal(instance.res.statusCode, 413);
        instance.res.end = fn;
        done();
      };
      instance.run();
    });

    it('common post.max_fields_size', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        var arr = [];
        for (var i = 0; i < 40; i++) {
          arr.push(Math.random() + '=' + (new Array(1000).join(Math.random() + '')));
        }
        instance.req.emit('data', new Buffer(arr.join('&')));
        instance.req.emit('end');
      });
      think.config('post.max_fields', 50);
      think.config('post.max_fields_size', 1000);
      var fn = instance.res.end;
      instance.res.statusCode = 200;
      instance.res.end = function() {
        assert.equal(instance.res.statusCode, 413);
        instance.res.end = fn;
        done();
      };
      instance.run();
    });

    it('file upload', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip',
        'content-type': 'multipart/form-data; boundary=maxzhang'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.form.emit('file', 'image', 'maxzhang');
        instance.form.emit('close');
      });
      think.config('post.max_fields', 150);
      think.config('post.max_fields_size', 1000);
      instance.run().then(function(http) {
        assert.deepEqual(http.file(), {
          image: 'maxzhang'
        });
        done();
      });
    });

    it('file upload, filed', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip',
        'content-type': 'multipart/form-data; boundary=maxzhang'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.form.emit('field', 'image', 'maxzhang');
        instance.form.emit('close');
      });
      think.config('post.max_fields', 150);
      think.config('post.max_fields_size', 1000);
      instance.run().then(function(http) {
        assert.deepEqual(http.post(), {
          image: 'maxzhang'
        });
        done();
      });
    });

    it('file upload, error', function(done) {
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip',
        'content-type': 'multipart/form-data; boundary=maxzhang'
      };
      instance.req.method = 'POST';
      instance.res.statusCode = 200;
      process.nextTick(function() {
        instance.form.emit('error', new Error('test'));
      });
      think.config('post.max_fields', 150);
      think.config('post.max_fields_size', 1000);
      instance.run();
      instance.res.end = function() {
        assert.equal(instance.res.statusCode, 413);
        done();
      };
    });

  });

});
