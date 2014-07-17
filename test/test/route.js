var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');


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

describe('Route', function(){
  var promise = instance;
  it('url_route_on off', function(done){
    C('url_route_on', false)
    promise.then(function(http){
      return B('CheckRoute', http)
    }).then(function(data){
      assert.equal(data, false);
      C('url_route_on', true)
      done();
    })
  })
  it('url_route_rules empty', function(done){
    C('url_route_rules', [])
    promise.then(function(http){
      return B('CheckRoute', http)
    }).then(function(data){
      assert.equal(data, false);
      done();
    })
  })
  it('reg rule', function(done){
    C('url_route_rules', [
      [/^index/, 'index/index']
    ])
    promise.then(function(http){
      http.pathname = 'welefen/suredy';
      return B('CheckRoute', http)
    }).then(function(data){
      assert.equal(data, false);
      done();
    })
  })
  it('reg rule match', function(done){
    C('url_route_rules', [
      [/^(?:group|zhuanji)\/(\d{8})\/([1-9]\d+)(?:_(\d+))?/,  'group/detail?date=:1&groupId=:2&page=:3'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'group/20140807/1111';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.controller, 'Group');
      assert.equal(httpInstance.action, 'detail');
      assert.deepEqual(httpInstance.get, {
        date: '20140807',
        groupId: '1111',
        page: '' 
      });
      done();
    })
  })
  it('reg rule match 1', function(done){
    C('url_route_rules', [
      [/^(?:group|zhuanji)\/(\d{8})\/([1-9]\d+)(?:_(\d+))?/,  'group/detail?date=:1&groupId=:2&page=:3'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'group/20140807/1111';
      http.get = {
        page: 2
      };
      return B('CheckRoute', http);
    }).then(function(data){
      assert.deepEqual(httpInstance.get, {
        date: '20140807',
        groupId: '1111',
        page: 2
      });
      done();
    })
  })
  it('reg rule match with extra pars', function(done){
    C('url_route_rules', [
      [/^(?:group|zhuanji)\/(\d{8})\/([1-9]\d+)(?:_(\d+))?/,  'group/detail?date=:1&groupId=:2&page=:3'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'group/20140807/1111/name/welefen';
      http.get = {
        page: 2
      };
      return B('CheckRoute', http);
    }).then(function(data){
      assert.deepEqual(httpInstance.get, {
        date: '20140807',
        groupId: '1111',
        page: 2,
        name: 'welefen'
      });
      done();
    })
  })

  it('reg rule with method', function(done){
    C('url_route_rules', [
      [/^(?:group|zhuanji)\/(\d{8})\/([1-9]\d+)(?:_(\d+))?/,  {
        get: 'group/detail?date=:1&groupId=:2&page=:3'
      }], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'group/20140807/1111';
      http.get = {
        page: 2
      };
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(data, true)
      assert.deepEqual(httpInstance.get, {
        date: '20140807',
        groupId: '1111',
        page: 2
      });
      done();
    })
  })

  it('reg rule with post method', function(done){
    C('url_route_rules', [
      [/^(?:group|zhuanji)\/(\d{8})\/([1-9]\d+)(?:_(\d+))?/,  {
        post: 'group/detail?date=:1&groupId=:2&page=:3'
      }], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'group/20140807/1111';
      http.get = {
        page: 2
      };
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(data, false)
      done();
    })
  })

  it('reg rule with RESTFUL get', function(done){
    C('url_route_rules', [
      [/^(\w+)(?:\/(\d+))?/,  'RESTFUL'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.group, 'Restful');
      assert.equal(httpInstance.controller, 'User');
      assert.equal(httpInstance.action, 'get');
      assert.deepEqual(httpInstance.get, {resource: 'user'});
      done();
    })
  })

  it('reg rule with RESTFUL 1', function(done){
    C('url_route_rules', [
      [/^(\w+)(?:\/(\d+))?/,  'RESTFUL'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.group, 'Restful');
      assert.equal(httpInstance.controller, 'User');
      assert.equal(httpInstance.action, 'get');
      assert.deepEqual(httpInstance.get, {resource: 'user', id: '1111'});
      done();
    })
  })

  it('reg rule with RESTFUL post', function(done){
    C('url_route_rules', [
      [/^(\w+)(?:\/(\d+))?/,  'RESTFUL'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.method = 'POST';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.group, 'Restful');
      assert.equal(httpInstance.controller, 'User');
      assert.equal(httpInstance.action, 'post');
      assert.deepEqual(httpInstance.get, {resource: 'user', id: '1111'});
      done();
    })
  })

  it('reg rule with RESTFUL delete', function(done){
    C('url_route_rules', [
      [/^(\w+)(?:\/(\d+))?/,  'RESTFUL'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.method = 'DELETE';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.group, 'Restful');
      assert.equal(httpInstance.controller, 'User');
      assert.equal(httpInstance.action, 'delete');
      assert.deepEqual(httpInstance.get, {resource: 'user', id: '1111'});
      done();
    })
  })
  it('reg rule with RESTFUL put', function(done){
    C('url_route_rules', [
      [/^(\w+)(?:\/(\d+))?/,  'RESTFUL'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.method = 'PUT';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.group, 'Restful');
      assert.equal(httpInstance.controller, 'User');
      assert.equal(httpInstance.action, 'put');
      assert.deepEqual(httpInstance.get, {resource: 'user', id: '1111'});
      done();
    })
  })

  it('reg rule with RESTFUL other', function(done){
    C('url_route_rules', [
      [/^(\w+)(?:\/(\d+))?/,  'RESTFUL'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.method = 'OTHER';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.group, 'Restful');
      assert.equal(httpInstance.controller, 'User');
      assert.equal(httpInstance.action, 'other');
      assert.deepEqual(httpInstance.get, {resource: 'user', id: '1111'});
      done();
    })
  })
  //自定义group
  it('reg rule with RESTFUL Home Group', function(done){
    C('url_route_rules', [
      [/^(\w+)(?:\/(\d+))?/,  'RESTFUL:Home'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.method = 'OTHER';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(httpInstance.group, 'Home');
      assert.equal(httpInstance.controller, 'User');
      assert.equal(httpInstance.action, 'other');
      assert.deepEqual(httpInstance.get, {resource: 'user', id: '1111'});
      done();
    })
  })
  it('string rule false', function(done){
    C('url_route_rules', [
      ['user/:\\d',  'index/index?user_id=:1'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'fasdfasdf/1111';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(data, false);
      done();
    })
  })

  it('string rule with \\d', function(done){
    C('url_route_rules', [
      ['user/:\\d',  'index/index?user_id=:1'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.deepEqual(httpInstance.get, { user_id: '1111' });
      assert.equal(httpInstance.group, 'Home');
      assert.equal(httpInstance.controller, 'Index');
      assert.equal(httpInstance.action, 'index');
      done();
    })
  })
  it('string rule with \\d false', function(done){
    C('url_route_rules', [
      ['user/:\\d',  'index/index?user_id=:1'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/werwer';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(data, false)
      done();
    })
  })
  it('string rule with \\w', function(done){
    C('url_route_rules', [
      ['user/:\\w',  'index/index?user_id=:1'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.deepEqual(httpInstance.get, { user_id: '1111' });
      assert.equal(httpInstance.group, 'Home');
      assert.equal(httpInstance.controller, 'Index');
      assert.equal(httpInstance.action, 'index');
      done();
    })
  })
  it('string rule with \\w false', function(done){
    C('url_route_rules', [
      ['user/:\\w',  'index/index?user_id=:1'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/*&w';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(data, false);
      done();
    })
  })
  it('string rule with \\w, post method', function(done){
    C('url_route_rules', [
      ['user/:\\w',  {get: 'index/index?user_id=:1'}], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.get = {};
      http.method = 'POST';
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(data, false);
      done();
    })
  })
  it('string rule with :user_id', function(done){
    C('url_route_rules', [
      ['user/:user_id',  'index/index'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.deepEqual(httpInstance.get, { user_id: '1111' });
      assert.equal(httpInstance.group, 'Home');
      assert.equal(httpInstance.controller, 'Index');
      assert.equal(httpInstance.action, 'index');
      done();
    }).catch(function(err){
      console.log(err)
    })
  })
  it('string rule with :user_id extra pars', function(done){
    C('url_route_rules', [
      ['user/:user_id',  'index/index'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111/name/welefen';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.deepEqual(httpInstance.get, { user_id: '1111' ,name: 'welefen'});
      assert.equal(httpInstance.group, 'Home');
      assert.equal(httpInstance.controller, 'Index');
      assert.equal(httpInstance.action, 'index');
      done();
    }).catch(function(err){
      console.log(err)
    })
  })
  it('string rule 1111', function(done){
    C('url_route_rules', [
      ['user/1111',  'index/index'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111/name/welefen';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.deepEqual(httpInstance.get, { name: 'welefen'});
      assert.equal(httpInstance.group, 'Home');
      assert.equal(httpInstance.controller, 'Index');
      assert.equal(httpInstance.action, 'index');
      done();
    })
  })
  it('string rule 111', function(done){
    C('url_route_rules', [
      ['user/111',  'index/index'], 
    ])
    var httpInstance;
    promise.then(function(http){
      httpInstance = http;
      http.pathname = 'user/1111/name/welefen';
      http.get = {};
      return B('CheckRoute', http);
    }).then(function(data){
      assert.equal(data, false)
      done();
    })
  })



})