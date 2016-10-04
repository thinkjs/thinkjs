'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;
var Socket = require('net').Socket;
var IncomingMessage = require('http').IncomingMessage;
var muk = require('muk');

var thinkjs = require('../../lib/index.js');
new thinkjs().load();


var Http = think.safeRequire(path.resolve(__dirname, '../../lib/core/http.js'));

var localeIp = '127.0.0.1';
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
      host: data.host || localeIp
    }, data.headers),
    connection: {
      remoteAddress: data.ip || localeIp
    }
  };
  var res = {
    end: data.end || data.close || noop,
    write: data.write || data.send || noop,
    headers: {},
    setHeader: function(name, value) {
      this.headers[name] = value;
    },
    setTimeout: noop,
    connection: {
      remoteAddress: data.ip || localeIp
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

think.APP_PATH = path.dirname(path.dirname(__dirname)) + think.sep + 'testApp';

describe('core/http.js', function() {
  it('is EventEmitter instance, false', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&48');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http instanceof EventEmitter, false);
      done();
    });
  });

  it('response timeout', function(done) {
    var timeoutHttp = getDefaultHttp('/index/index?k=timeout');
    think.config('timeout', 0.01);
    muk(think, 'log', function(){})
    timeoutHttp.res.setTimeout = function(delay, fn) {
      done();
      setTimeout(fn, delay);
    };
    var instance = new Http(timeoutHttp.req, timeoutHttp.res);
    instance.run();
    think.config('timeout', 10);
  });
  it('response timeout false', function(done) {
    var timeoutHttp = getDefaultHttp('/index/index?k=timeout');
    think.config('timeout', 0);
    muk(think, 'log', function(){});
    var flag = false;
    timeoutHttp.res.setTimeout = function(delay, fn) {
      flag = true;
      setTimeout(fn, delay);
    };
    var instance = new Http(timeoutHttp.req, timeoutHttp.res);
    instance.run().then(function(){
      assert.equal(flag, false)
      done();
    });
    think.config('timeout', 10);
  });

  it('parse pathname /', function(done) {
    var defaultHttp = getDefaultHttp('/');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.pathname, '/');
      done();
    });
  });
  it('parse pathname /', function(done) {
    var defaultHttp = getDefaultHttp({
      url: '/',
      headers: {
        host: 'test.com:1234'
      }
    });
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.pathname, '/');
      assert.deepEqual(http.hostname, 'test.com')
      done();
    });
  });
  it('parse pathname', function(done) {
    var defaultHttp = getDefaultHttp('/index/index/name/w%2Fww');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.pathname, 'index/index/name/w%2Fww');
      done();
    });
  });
  it('parse pathname 1', function(done) {
    var defaultHttp = getDefaultHttp('/index/w%2Fww');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.pathname, 'index/w%2Fww');
      done();
    });
  });

  it('hasPayload', function() {
    var defaultHttp = getDefaultHttp({
      url: '/',
      headers: {
        
      }
    });
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    var data = instance.hasPayload();
    assert.equal(data, false)
  });
  it('hasPayload transfer-encoding', function() {
    var defaultHttp = getDefaultHttp({
      url: '/',
      headers: {
        'transfer-encoding': 'gzip'
      }
    });
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    var data = instance.hasPayload();
    assert.equal(data, true)
  });
  it('hasPayload content-length', function() {
    var defaultHttp = getDefaultHttp({
      url: '/',
      headers: {
        'content-length': 100
      }
    });
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    var data = instance.hasPayload();
    assert.equal(data, true)
  });



  it('GET, query', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&1');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.get(), { name: 'maxzhang', '1': '' });
      done();
    });
  });

  it('GET, set', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&2');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.get({ name: 'thinkjs' });
      assert.equal(http.get('name'), 'thinkjs');
      done();
    });
  });

  it('param', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&3');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.param('name'), 'maxzhang');
      done();
    });
  });

  it('get headers', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&4');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.deepEqual(http.header(), { host: '127.0.0.1' });
      done();
    });
  });

  it('get special header', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&5');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.header('user-agent'), '');
      done();
    });
  });

  it('get type', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&6');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'content-type': 'application/json'
      }
    })
    var instance = new Http(req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.type(), 'application/json');
      done();
    }).catch(function(err) {
      console.log(err.stack)
    });
  });

  it('get type, _contentTypeIsSend', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&7');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'content-type': 'text/html'
      }
    })
    var instance = new Http(req, defaultHttp.res);
    instance.run().then(function(http) {
      http._contentTypeIsSend = true;
      http.type('application/json');
      assert.equal(http.type(), 'text/html');
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  });

  it('set type', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&8');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.req.headers = {
      'content-type': 'text/html'
    };
    instance.run().then(function(http) {
      http.type('application/json');
      assert.equal(http.res.headers['Content-Type'].indexOf('application/json') !== -1, true);
      done();
    });
  });

  it('set type, lookup mimetype', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&9');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.req.headers = {
      'content-type': 'text/html'
    };
    instance.run().then(function(http) {
      http.type('json');
      assert.equal(http.res.headers['Content-Type'].indexOf('application/json') !== -1, true);
      done();
    });
  });

  it('get referrer', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&10');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'referrer': 'http://www.thinkjs.org/index?name=maxzhang'
      }
    })
    var instance = new Http(req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.referrer('www.thinkjs.org'), 'www.thinkjs.org');
      done();
    });
  });

  it('isAjax 1', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&11');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      }
    })
    var instance = new Http(req, defaultHttp.res);
    instance.req.method = 'POST';
    instance.run().then(function(http) {
      assert.equal(http.isAjax(), true);
      done();
    });
  });

  it('isAjax 2', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&12');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      },
      method: 'POST'
    })
    var instance = new Http(req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.isAjax('GET'), false);
      done();
    });
  });

  it('ip', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&13');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.host = '127.0.0.1:8360';
    instance.run().then(function(http) {
      assert.equal(http.ip(), '127.0.0.1');
      done();
    });
  });

  it('ip with socket', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&14');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.host = '127.0.0.1:8360';
      http.req.socket = {
        remoteAddress: '10.0.0.1'
      };
      assert.equal(http.ip(), '10.0.0.1');
      done();
    });
  });

  it('ip with connection', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&15');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.host = '127.0.0.1:8360';
      http.req.connection = {
        remoteAddress: '10.0.0.1'
      };
      assert.equal(http.ip(), '10.0.0.1');
      done();
    });
  });

  it('ip with ::', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&16');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.host = '127.0.0.1:8360';
      http.req.connection = {
        remoteAddress: '::ff:10.0.0.1'
      };
      assert.equal(http.ip(), '10.0.0.1');
      done();
    });
  });

  it('ip with x-real-ip', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&17');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'x-real-ip': '10.0.0.1'
      }
    })
    var instance = new Http(req, defaultHttp.res);
    think.config('proxy_on', true);
    instance.run().then(function(http) {
      assert.equal(http.ip(), '10.0.0.1');
      think.config('proxy_on', false);
      done();
    }).catch(function(err){
      console.log(err.stack)
    });
  });

  it('ip with x-forwarded-for', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&18');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'x-forwarded-for': '10.0.0.1'
      }
    })
    var instance = new Http(req, defaultHttp.res);
    think.config('proxy_on', true);
    instance.req.headers = {
      'x-forwarded-for': '10.0.0.1'
    };
    instance.run().then(function(http) {
      assert.equal(http.ip(true), '10.0.0.1');
      think.config('proxy_on', false);
      done();
    });
  });

  it('ip, is not ip', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&19');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    var fn = think.isIP;
    think.isIP = function() { return false; };
    instance.run().then(function(http) {
      http.host = '127.0.0.1:8360';
      http.req.connection = {
        remoteAddress: '10.0.0.1'
      };
      assert.equal(http.ip(), '127.0.0.1');
      think.isIP = fn;
      done();
    });
  });

  it('set header', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&20');
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
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&21');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.res.headersSent = true;
      http.header('name', 'maxzhang');
      done();
    });
  });

  it('set header, _contentTypeIsSend', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&22');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.req.headers = {
      'content-type': 'text/html'
    };
    instance.run().then(function(http) {
      http.res.headersSent = false;
      http.header('Content-Type', 'application/json');
      http.header('Content-Type', 'text/html');
      assert.equal(http.res.headers['Content-Type'].indexOf('application/json') !== -1, true);
      done();
    });
  });

  it('set status', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&23');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.res.headersSent = false;
      http.status(302);
      assert.equal(http.res.statusCode, 302);
      done();
    });
  });

  it('set status return', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&23');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.res.headersSent = false;
      var data = http.status(302);
      assert.equal(http.res.statusCode, 302);
      assert.equal(data, http);
      done();
    });
  });
  it('set status default', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&24');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.res.headersSent = false;
      http.status();
      assert.equal(http.res.statusCode, 200);
      done();
    });
  });
  it('get file 1', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&24');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http._file = {image: {name: 'welefen'}}
      var data = http.file('image');
      assert.deepEqual(data, {name: 'welefen'})
      done();
    });
  });
  it('get file 2', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&24');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http._file = {image: {name: 'welefen'}}
      var data = http.file('image');
      data.name = 'suredy';
      assert.deepEqual(http._file, {image: {name: 'welefen'}})
      done();
    });
  });

  it('get user agent', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang');
    var req = think.extend({}, defaultHttp.req, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2478.0 Safari/537.36'
      }
    })
    var instance = new Http(req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.userAgent(), 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2478.0 Safari/537.36');
      done();
    })
  });

  it('get empty user agent', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&25');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.userAgent(), '');
      done();
    });
  });

  it('set cookie', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&26');
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
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&27');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', 'maxzhang', 10000);
      assert.equal(http._sendCookie.name.expires !== undefined, true);
      assert.equal(http._sendCookie.name.expires instanceof Date, true);
      done();
    });
  });

  it('set cookie with timeout 1', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&28');
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
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&29');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('name', null);
      assert.equal(http._sendCookie.name.expires !== undefined, true);
      assert.equal(http._sendCookie.name.expires instanceof Date, true);
      done();
    });
  });

  it('set cookie, with options', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&30');
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
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&31');
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
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&32');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie(true);
      done();
    });
  });

  it('send cookie multi', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&33');
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
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&34');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      muk(think, 'log', function(){})
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'Location');
        assert.equal(value, '/');
        http.res.setHeader = fn;
      };
      var fn1 = http.res.end;
      http.res.end = function() {
        http.res.end = fn1;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      http.redirect();
      assert.equal(http.res.statusCode, 302);
    });
  });

  it('redirect url', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&35');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.setHeader = function(name, value) {
        assert.equal(name, 'Location');
        assert.equal(value, 'http://www.thinkjs.org');
        http.res.setHeader = fn;
      };
      var fn1 = http.res.end;
      muk(think, 'log', function(){})
      http.res.end = function() {
        http.res.end = fn1;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      http.redirect('http://www.thinkjs.org', 301);
      assert.equal(http.res.statusCode, 301);
    });
  });

  it('sendTime empty', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&36');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.setHeader = function(name) {
        assert.equal(name, 'X-EXEC-TIME');
        http.res.setHeader = fn;
        done();
      };
      http.sendTime();
    });
  });

  it('sendTime name', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&37');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.setHeader;
      http.res.setHeader = function(name) {
        assert.equal(name, 'X-TEST');
        http.res.setHeader = fn;
        done();
      };
      http.sendTime('TEST');
    });
  });
  it('get post data, all', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&37');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http._post = {};
      var data = http.post();
      assert.deepEqual(data, {});
      done();
    });
  });
  it('get post data, name', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&37');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http._post = {name: 'test'};
      var data = http.post('name');
      assert.deepEqual(data, 'test');
      done();
    });
  });
  it('get post data, 0', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&37');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http._post = {name: 0};
      var data = http.post('name');
      assert.deepEqual(data, 0);
      done();
    });
  });
  it('get post data, false', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&37');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http._post = {name: false};
      var data = http.post('name');
      assert.deepEqual(data, false);
      done();
    });
  });
  it('get post data, undefined', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&37');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http._post = {name: 0};
      var data = http.post('name111');
      assert.deepEqual(data, '');
      done();
    });
  });

  it('write empty', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&38');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      assert.equal(http.write(), undefined);
      done();
    });
  });

  it('write array', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&39');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '[1,2,3]');
        http.res.write = fn;
        done();
      };
      http.write([1, 2, 3]);
    });
  });

  it('write obj', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&40');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '{"name":"maxzhang"}');
        http.res.write = fn;
        done();
      };
      http.write({
        name: 'maxzhang'
      });
    });
  });

  it('write str', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&41');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, 'maxzhang');
        http.res.write = fn;
        done();
      };
      http.write('maxzhang');
    });
  });

  it('write str', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&42');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      var buffer = new Buffer(10);
      http.res.write = function(content) {
        assert.equal(content, buffer);
        http.res.write = fn;
        done();
      };
      http.write(buffer);
    });
  });

  it('write true', function(done) {
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&43');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, 'true');
        http.res.write = fn;
        done();
      };
      http.write(true);
    });
  });

  it('write no encoding', function(done) {
    var defaultHttp = getDefaultHttp('/index/index&method=post');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, 'true');
        http.res.write = fn;
        done();
      };
      http.write(true);
    });
  });

  it('success', function(done) {
    muk(think, 'log', function(){})
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&44');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '{"errno":0,"errmsg":"success","data":{"name":"thinkjs"}}');
        http.res.write = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)

      };
      http.success({ 'name': 'thinkjs' }, 'success');
    });
  });

  it('fail', function(done) {
    muk(think, 'log', function(){})
    var defaultHttp = getDefaultHttp('/index/index&method=post&2');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '{"errno":500,"errmsg":"error","data":{"name":"thinkjs"}}');
        http.res.write = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      http.fail(500, 'error', { 'name': 'thinkjs' });
    });
  });

  it('fail with object', function(done) {
    muk(think, 'log', function(){})
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&45');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '{"errno":500,"errmsg":"error","data":{"name":"thinkjs"}}');
        http.res.write = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      http.fail({
        errno: 500,
        errmsg: 'error',
        data: { 'name': 'thinkjs' }
      });
    });
  });

  it('jsonp', function(done) {
    muk(think, 'log', function(){})
    var defaultHttp = getDefaultHttp('/index/index&method=post&3');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.get('callback', 'callback1');
      http.res.write = function(content) {
        assert.equal(content, 'callback1({"name":"thinkjs"})');
        http.res.write = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      http.jsonp({ 'name': 'thinkjs' });
    });
  });

  it('jsonp without callback', function(done) {
    muk(think, 'log', function(){})
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&46');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.res.write = function(content) {
        assert.equal(content, '{"name":"thinkjs"}');
        http.res.write = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      http.jsonp({ 'name': 'thinkjs' });
    });
  });

  it('jsonp, empty data', function(done) {
    muk(think, 'log', function(){})
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&47');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      var fn = http.res.write;
      http.get('callback', 'callback1');
      http.res.write = function(content) {
        assert.equal(content, 'callback1()');
        http.res.write = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      http.jsonp();
    });
  });

  it('get cookie from set', function(done) {
    muk(think, 'log', function(){})
    var defaultHttp = getDefaultHttp('/index/index?name=maxzhang&47');
    var instance = new Http(defaultHttp.req, defaultHttp.res);
    instance.run().then(function(http) {
      http.cookie('wwwwww', 'sss');
      var value = http.cookie('wwwwww');
      assert.equal(value, 'sss');
      done();
    });
  });

/*
  describe('HTTP POST', function() {
    it('hasPostData false', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&4');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      assert.equal(instance.hasPostData(), false);
      done();
    });

    it('hasPostData true', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&5');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.http.req.headers['transfer-encoding'] = 'gzip';
      instance.run().then(function() {
        assert.equal(instance.hasPostData(), true);
        done();
      });
    });

    it('hasPostData true', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&6');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      delete instance.http.req.headers['transfer-encoding'];
      instance.http.req.headers['content-length'] = 100;
      assert.equal(instance.hasPostData(), true);
      done();
    });

    it('common post, no data', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&7');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage();
      instance.req.url = defaultHttp.req.url;
      instance.req.method = 'POST';
      instance.run().then(function() {
        done();
      });
    });

    it('common post, set POST data', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&8');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.method = 'POST';
      instance.run().then(function(http) {
        http.post({ name: 'maxzhang' });
        assert.deepEqual(http.post(), {
          name: 'maxzhang'
        });
        done();
      });
    });

    it('common post with data', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&9');
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
      var defaultHttp = getDefaultHttp('/index/index&method=post&10');
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

    it('common post with json data', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&11');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip',
        'content-type': 'application/json'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.req.emit('data', new Buffer('{"name":"maxzhang"}'));
        instance.req.emit('end');
      });
      instance.run().then(function(http) {
        assert.deepEqual(http.post(), {
          name: 'maxzhang'
        });
        done();
      });
    });

    it('common post, parse querystring error', function(done) {
      muk(think, 'log', function(){})
      var defaultHttp = getDefaultHttp('/index/index&method=post&12');
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
      var fn = querystring.parse;
      querystring.parse = function() {
        throw new Error('test');
      };
      instance.res.end = function() {
        assert.equal(instance.res.statusCode, 400);
        querystring.parse = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      instance.run();
    });

    it('common post error', function(done) {
      muk(think, 'log', function(){})
      var defaultHttp = getDefaultHttp('/index/index&method=post&13');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip'
      };
      instance.req.method = 'POST';
      instance.res.statusCode = 200;
      process.nextTick(function() {
        instance.req.emit('error', new Error('test'));
      });
      think.config('post.max_fields', 150);
      think.config('post.max_fields_size', 1000);
      instance.run();
      instance.res.end = function() {
        assert.equal(instance.res.statusCode, 400);
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
    });

    it('common post.max_fields', function(done) {
      muk(think, 'log', function(){})
      var defaultHttp = getDefaultHttp('/index/index&method=post&14');
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
        assert.equal(instance.res.statusCode, 400);
        instance.res.end = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      instance.run();
    });

    it('common post.max_fields_size', function(done) {
      muk(think, 'log', function(){})
      var defaultHttp = getDefaultHttp('/index/index&method=post&15');
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
        assert.equal(instance.res.statusCode, 400);
        instance.res.end = fn;
        setTimeout(function(){
          muk.restore();
          done();
        }, 20)
      };
      instance.run();
    });

    it('file upload', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&16');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      var log = think.log;
      think.log = function(){};
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
        think.log = log;
        done();
      });
    });

    it('file upload, same name files', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&17');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip',
        'content-type': 'multipart/form-data; boundary=maxzhang'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.form.emit('file', 'image', 'maxzhang1');
        instance.form.emit('file', 'image', 'maxzhang2');
        instance.form.emit('close');
      });
      think.config('post.max_fields', 150);
      think.config('post.max_fields_size', 1000);
      instance.run().then(function(http) {
        assert.deepEqual(http.file(), {
          image: ['maxzhang1', 'maxzhang2']
        });
        done();
      });
    });

    it('file upload, field', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&18');
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
      muk(think, 'log', function(){})
      var defaultHttp = getDefaultHttp('/index/index&method=post&19');
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
        assert.equal(instance.res.statusCode, 400);
        setTimeout(function(){
          muk.restore();
          done();
        }, 30)
      };
    });

    it('file upload, clear tmp file', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&20');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      var log = think.log;
      think.log = function(){};
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
      var fn = fs.unlink;
      var fn1 = think.isFile;
      think.isFile = function() { return true; };
      fs.unlink = function(filepath) {
        fs.unlink = fn;
        think.isFile = fn1;
        think.log = log;
        done();
      };
      instance.run().then(function(http) {
        http._end();
      });
    });


    it('ajax file upload', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post&21');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip',
        'x-filename': '1.js'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.req.emit('data', new Buffer('maxzhang'));
        instance.req.emit('end');
      });
      think.config('post.max_fields', 150);
      think.config('post.max_fields_size', 1000);
      instance.run().then(function(http) {
        var file = http.file().file;
        assert.equal(file.originalFilename, '1.js');
        assert.equal(file.size, 8);
        assert.equal(file.path.indexOf('.js') > -1, true);
        done();
      });
    });

    /*
    it('ajax file upload error', function(done) {
      var defaultHttp = getDefaultHttp('/index/index&method=post');
      var instance = new Http(defaultHttp.req, defaultHttp.res);
      instance.req = new IncomingMessage(new Socket());
      instance.req.url = defaultHttp.req.url;
      instance.req.headers = {
        'transfer-encoding': 'gzip',
        'x-filename': '1.js'
      };
      instance.req.method = 'POST';
      process.nextTick(function() {
        instance.req.emit('error', new Error('test'));
      });
      think.config('post.max_fields', 150);
      think.config('post.max_fields_size', 1000);
      instance.run();
      instance.res.end = function() {
        assert.equal(instance.res.statusCode, 400);
        done();
      };
    });
    */


  //});

});
