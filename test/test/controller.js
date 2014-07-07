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
  'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,nl;q=0.2,zh-TW;q=0.2',
  'cookie': 'Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1=1380544681,1381634417,1381637116,1381660395; bdshare_firstime=1398851688467; visit_count=5; thinkjs=qSK6dvvHE1nDqzeMBOnIiw4LlbPdYGMB; Hm_lvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404201763,1404205823,1404219513,1404342531; Hm_lpvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404357406' 
};
req.method = 'GET';
req.httpVersion = '1.1';
req.url = '/index/index?name=welefen&value=1111';
var res = new http.ServerResponse(req);
var instance = Http(req, res).run();

describe('Controller', function(){
  var promise = instance.then(function(http){
    return thinkRequire('Controller')(http);
  })
  it('instance.ip()', function(done){
    promise.then(function(instance){
      assert.equal(instance.ip(), '127.0.0.1');
      done();
    })
  })
  it('instance.initView()', function(done){
    promise.then(function(instance){
      var View = thinkRequire('View');
      assert.equal(instance.initView() instanceof View, true);
      done();
    })
  })
  it('instance.isGet()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isGet(), true);
      done();
    })
  })
  it('instance.isPost()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isPost(), false);
      done();
    })
  })
  it('instance.isMethod("get")', function(done){
    promise.then(function(instance){
      assert.equal(instance.isMethod('get'), true);
      done();
    })
  })
  it('instance.isMethod("post")', function(done){
    promise.then(function(instance){
      assert.equal(instance.isMethod('post'), false);
      done();
    })
  })
  it('instance.isAjax()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isAjax(), false);
      done();
    })
  })
  it('instance.isAjax() 1', function(done){
    promise.then(function(instance){
      instance.http.headers['x-requested-with'] = 'XMLHttpRequest';
      assert.equal(instance.isAjax(), true);
      done();
    })
  })
  it('instance.isAjax("post")', function(done){
    promise.then(function(instance){
      instance.http.headers['x-requested-with'] = 'XMLHttpRequest';
      assert.equal(instance.isAjax('post'), false);
      done();
    })
  })
  it('instance.isAjax("POST")', function(done){
    promise.then(function(instance){
      instance.http.headers['x-requested-with'] = 'XMLHttpRequest';
      assert.equal(instance.isAjax('POST'), false);
      done();
    })
  })
  it('instance.isAjax("GET")', function(done){
    promise.then(function(instance){
      instance.http.headers['x-requested-with'] = 'XMLHttpRequest';
      assert.equal(instance.isAjax('GET'), true);
      done();
    })
  })
  it('instance.isAjax("get")', function(done){
    promise.then(function(instance){
      instance.http.headers['x-requested-with'] = 'XMLHttpRequest';
      assert.equal(instance.isAjax('get'), true);
      done();
    })
  })

  it('instance.isWebSocket()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isWebSocket(), false);
      done();
    })
  })
  it('instance.isWebSocket() 1', function(done){
    promise.then(function(instance){
      instance.http.websocket = {};
      assert.equal(instance.isWebSocket(), true);
      done();
    })
  })

  it('instance.isCli()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isCli(), true);
      done();
    })
  })
  it('instance.isCli() 1', function(done){
    promise.then(function(instance){
      APP_MODE = '';
      assert.equal(instance.isCli(), false);
      APP_MODE = 'cli';
      done();
    })
  })

  it('instance.isJsonp()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isJsonp(), false);
      done();
    })
  })
  it('instance.isJsonp()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isJsonp(), false);
      done();
    })
  })
  it('instance.isJsonp() 1', function(done){
    promise.then(function(instance){
      instance.http.get.callback = 'callback'
      assert.equal(instance.isJsonp(), true);
      delete instance.http.get.callback;
      done();
    })
  })
  it('instance.isJsonp() 2', function(done){
    promise.then(function(instance){
      instance.http.get.callback = 'callback'
      assert.equal(instance.isJsonp('callback_other_name'), false);
      delete instance.http.get.callback;
      done();
    })
  })


  it('instance.get("name")', function(done){
    promise.then(function(instance){
      //console.log(instance.get("name"));
      assert.equal(instance.get('name'), 'welefen');
      done();
    })
  })
  it('instance.get("value")', function(done){
    promise.then(function(instance){
      //console.log(instance.get("name"));
      assert.equal(instance.get('value'), '1111');
      done();
    })
  })
  it('instance.get("xxxxx")', function(done){
    promise.then(function(instance){
      //console.log(instance.get("name"));
      assert.equal(instance.get('xxxxx'), '');
      done();
    })
  })
  it('instance.get()', function(done){
    promise.then(function(instance){
      //console.log(JSON.stringify(instance.get()));
      assert.equal(JSON.stringify(instance.get()), '{"name":"welefen","value":"1111"}');
      done();
    })
  })
  it('instance.post()', function(done){
    promise.then(function(instance){
      //console.log(JSON.stringify(instance.get()));
      assert.equal(JSON.stringify(instance.post()), '{}');
      done();
    })
  })
  it('instance.post("xxx")', function(done){
    promise.then(function(instance){
      //console.log(JSON.stringify(instance.get()));
      assert.equal(instance.post('xxx'), '');
      done();
    })
  })

  it('instance.param()', function(done){
    promise.then(function(instance){
      //console.log(instance.param())
      assert.deepEqual(instance.param(), {"name":"welefen","value":"1111"});
      done();
    })
  })
  it('instance.param() 1', function(done){
    promise.then(function(instance){
      //console.log(instance.param())
      instance.http.post.name = 'post'
      assert.deepEqual(instance.param(), {"name":"post"});
      delete instance.http.post.name;
      done();
    })
  })
  it('instance.param("name")', function(done){
    promise.then(function(instance){
      //console.log(instance.param())
      assert.equal(instance.param('name'), 'welefen');
      done();
    })
  })
  it('instance.param("name") 1', function(done){
    promise.then(function(instance){
      //console.log(instance.param())
      instance.http.post.name = 'post'
      assert.equal(instance.param('name'), 'post');
      delete instance.http.post.name;
      done();
    })
  })
  it('instance.file()', function(done){
    promise.then(function(instance){
      assert.deepEqual(instance.file(), {});
      done();
    })
  })
  it('instance.file("xxx")', function(done){
    promise.then(function(instance){
      assert.deepEqual(instance.file('xxx'), {});
      done();
    })
  })
  it('instance.file("xxx") 111', function(done){
    promise.then(function(instance){
      instance.http.file = {
        xxx : {
          name: 'welefen'
        }
      }
      assert.deepEqual(instance.file('xxx'), {
          name: 'welefen'
        });
      done();
    })
  })


  it('instance.header()', function(done){
    promise.then(function(instance){
      //console.log(instance.userAgent());
      assert.deepEqual(instance.header(), { 'x-real-ip': '127.0.0.1',
        'x-forwarded-for': '127.0.0.1',
        host: 'meinv.ueapp.com',
        'x-nginx-proxy': 'true',
        connection: 'close',
        'cache-control': 'max-age=0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
        'accept-encoding': 'gzip,deflate,sdch',
        'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,nl;q=0.2,zh-TW;q=0.2',
        cookie: 'Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1=1380544681,1381634417,1381637116,1381660395; bdshare_firstime=1398851688467; visit_count=5; thinkjs=qSK6dvvHE1nDqzeMBOnIiw4LlbPdYGMB; Hm_lvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404201763,1404205823,1404219513,1404342531; Hm_lpvt_3a35dfea7bd1bb657c1ecd619a3c6cdd=1404357406',
        'x-requested-with': 'XMLHttpRequest' });
      done();
    })
  })
  it('instance.header("x-real-ip")', function(done){
    promise.then(function(instance){
      //console.log(instance.userAgent());
      assert.deepEqual(instance.header('x-real-ip'), '127.0.0.1' );
      done();
    })
  })
  it('instance.header("x-xxx")', function(done){
    promise.then(function(instance){
      //console.log(instance.userAgent());
      assert.deepEqual(instance.header('x-xxx'), '' );
      done();
    })
  })
  it('instance.header("name", "welefen")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res.setHeader = function(name, value){
        assert.equal(name, 'name');
        assert.equal(value, 'welefen');
        done();
        instance.http.res.setHeader = fn;
      }
      instance.header('name', 'welefen');
    })
  })
  it('instance.header({"name": "welefen", "value": "suredy"})', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      var i = 0;
      instance.http.res.setHeader = function(name, value){
        assert.equal(name == 'name' || name == 'value', true);
        assert.equal(value == 'welefen' || value == 'suredy', true);
        i++;
        if (i == 2) {
          done();
          instance.http.res.setHeader = fn;
        };
      }
      instance.header({"name": "welefen", "value": "suredy"});
    })
  })


  it('instance.userAgent()', function(done){
    promise.then(function(instance){
      //console.log(instance.userAgent());
      assert.equal(instance.userAgent(), 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36');
      done();
    })
  })
  it('instance.referer()', function(done){
    promise.then(function(instance){
      //console.log(instance.userAgent());
      assert.equal(instance.referer(), '');
      done();
    })
  })
  it('instance.referer()', function(done){
    promise.then(function(instance){
      instance.http.headers.referer = 'http://www.thinkjs.org'
      //console.log(instance.userAgent());
      assert.equal(instance.referer(), 'http://www.thinkjs.org');
      done();
    })
  })
  it('instance.cookie()', function(done){
    promise.then(function(instance){
      assert.deepEqual(instance.cookie(), { 
        Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1: '1380544681,1381634417,1381637116,1381660395',
        bdshare_firstime: '1398851688467',
        visit_count: '5',
        thinkjs: 'qSK6dvvHE1nDqzeMBOnIiw4LlbPdYGMB',
        Hm_lvt_3a35dfea7bd1bb657c1ecd619a3c6cdd: '1404201763,1404205823,1404219513,1404342531',
        Hm_lpvt_3a35dfea7bd1bb657c1ecd619a3c6cdd: '1404357406' 
      })
      done();
    })
  })
  it('instance.cookie("xxx")', function(done){
    promise.then(function(instance){
      //console.log(JSON.stringify(instance.cookie()));
      assert.equal(instance.cookie('xxxx'), '');
      done();
    })
  })
  it('instance.cookie("Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1")', function(done){
    promise.then(function(instance){
      //console.log(JSON.stringify(instance.cookie()));
      assert.equal(instance.cookie('Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1'), '1380544681,1381634417,1381637116,1381660395');
      done();
    })
  })
  it('instance.session("xxsfasdf")', function(done){
    promise.then(function(instance){
      return instance.session('xxsfasdf')
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('instance.session("xxsfasdf", "welefen")', function(done){
    var ins;
    promise.then(function(instance){
      ins = instance;
      return instance.session('xxsfasdf', 'welefen');
    }).then(function(){
      return ins.session('xxsfasdf');
    }).then(function(data){
      assert.equal(data, 'welefen');
      done();
    }).catch(function(err){
      console.log(err)
    })
  })
  it('instance.session("xxsfasdf", "welefen")', function(done){
    var ins;
    promise.then(function(instance){
      ins = instance;
      return instance.session();
    }).then(function(){
      return ins.session('xxsfasdf');
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('instance.session("xxsfasdf", "welefen").session()', function(done){
    var ins;
    promise.then(function(instance){
      ins = instance;
      return instance.session('welefen', 'suredy');
    }).then(function(){
      return ins.session('name', 'welefen');
    }).then(function(){
      return ins.session('welefen');
    }).then(function(data){
      assert.equal(data, 'suredy');
      done();
    })
  })
  it('instance.session("xxx")', function(done){
    var ins;
    promise.then(function(instance){
      ins = instance;
      return instance.session('welefen', 'suredy');
    }).then(function(){
      return ins.session('welefen', 'welefen');
    }).then(function(){
      return ins.session('welefen');
    }).then(function(data){
      assert.equal(data, 'welefen');
      done();
    })
  })


  it('instance.redirect()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res.setHeader = function(name, value){
        assert.equal(name, 'Location');
        assert.equal(value, '/');
        assert.equal(instance.http.res.statusCode, 302);
        instance.http.res.setHeader = fn;
        done();
      }
      instance.redirect();
    })
  })
  it('instance.redirect() 1', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.res.setHeader = function(name, value){
        assert.equal(name, 'Location');
        assert.equal(value, 'http://www.welefen.com');
        assert.equal(instance.http.res.statusCode, 301);
        instance.http.res.setHeader = fn;
        done();
      }
      instance.redirect('http://www.welefen.com', 301);
    })
  })
  it('instance.assign()', function(done){
    promise.then(function(instance){
      var data = instance.assign()
      assert.equal(isEmpty(data), false)
      assert.deepEqual(data.config, C());
      assert.deepEqual(data.http, instance.http)
      done();
    })
  })
  it('instance.assign("welefen")', function(done){
    promise.then(function(instance){
      var data = instance.assign("welefen")
      assert.equal(data, undefined)
      done();
    })
  })
  it('instance.assign("name", "welefen")', function(done){
    promise.then(function(instance){
      instance.assign('name', 'welefen')
      var data = instance.assign('name')
      assert.equal(data, 'welefen')
      done();
    })
  })
  it('instance.assign({"name": "welefen", value: "suredy"})', function(done){
    promise.then(function(instance){
      instance.assign({"name": "welefen", 'value': "suredy"})
      var data = instance.assign('name')
      assert.equal(data, 'welefen')
      assert.equal(instance.assign('value'), 'suredy')
      done();
    })
  })
  it('instance.fetch("home:index:index")', function(done){
    promise.then(function(instance){
      instance.fetch('home:index:index').then(function(content){
        assert.equal(content, 'hello, thinkjs!');
        done();
      })
    })
  })
  it('instance.fetch("Home/index_index.html")', function(done){
    promise.then(function(instance){
      instance.fetch('Home/index_index.html').then(function(content){
        assert.equal(content, 'hello, thinkjs!');
        done();
      })
    })
  })

  it('instance.fetch("index:index")', function(done){
    return promise.then(function(instance){
      instance.http.group = 'home';
      instance.fetch('index:index').then(function(content){
        assert.equal(content, 'hello, thinkjs!');
        done();
      })
    })
  })
  it('instance.display("home:index:index")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.echo;
      instance.http.res.write = function(content, encoding){
        assert.equal(content, 'hello, thinkjs!');
        assert.equal(encoding, 'utf8');
        instance.http.res.echo = fn;
        done();
      }
      instance.display('home:index:index');
    })
  })
  it('instance.display("index:index")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.echo;
      instance.http.res.write = function(content, encoding){
        assert.equal(content, 'hello, thinkjs!');
        assert.equal(encoding, 'utf8');
        instance.http.res.echo = fn;
        done();
      }
      instance.http.group = 'home';
      instance.display('index:index');
    })
  })
  it('instance.action("index:test")', function(done){
    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('index:test').then(function(content){
        assert.equal(content, 'welefen');
        done();
      })
    })
  })
  it('instance.action("test:test")', function(done){
    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('test:test').then(function(content){
        assert.equal(content, 'test:test');
        done();
      })
    })
  })
  it('instance.action("test:other")', function(done){
    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('test:other', ['name', 'value']).then(function(content){
        assert.equal(content, '{"name":"name","value":"value"}');
        //console.log(content)
        done();
      })
    })
  })


})
