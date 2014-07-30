var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs')


global.APP_PATH = path.normalize(__dirname + '/../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));


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
  it('instance.userAgent() empty', function(done){
    promise.then(function(instance){
      delete instance.http.headers['user-agent']
      assert.equal(instance.userAgent(), '');
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
  it('instance.referer(true)', function(done){
    promise.then(function(instance){
      instance.http.headers.referer = 'http://www.thinkjs.org'
      //console.log(instance.userAgent());
      assert.equal(instance.referer(true), 'www.thinkjs.org');
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
  it('instance.cookie("name", "welefen")', function(done){
    promise.then(function(instance){
      instance.http._cookie = {};
      instance.cookie("name", "welefen");
      assert.deepEqual(instance.http._cookie, { name: { path: '/', domain: '', name: 'name', value: 'welefen' } })
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
    var filepath = path.normalize(__dirname + '/../../App/View/Home/index_index.html');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'hello, thinkjs!')


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
      instance.http.group = 'Home';
      instance.fetch('index:index').then(function(content){
        assert.equal(content, 'hello, thinkjs!');
        done();
      })
    })
  })
  it('instance.display("home:index:index")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(content, encoding){
        assert.equal(content, 'hello, thinkjs!');
        assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.display('home:index:index');
    })
  })
  it('instance.display("index:index")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(content, encoding){
        assert.equal(content, 'hello, thinkjs!');
        assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.http.group = 'Home';
      instance.display('index:index');
    })
  })


  it('instance.action("index:test")', function(done){
    var filepath = path.normalize(__dirname + '/../../App/View/Home/index_test.html');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'welefen')
    var filepath = path.normalize(__dirname + '/../../App/Lib/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({testAction: function(){return this.fetch("index:test")}})')

    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('index:test').then(function(content){
        assert.equal(content, 'welefen');
        done();
      })
    })
  })
  it('instance.action("home:index:test")', function(done){
    var filepath = path.normalize(__dirname + '/../../App/View/Home/index_test.html');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'welefen')
    var filepath = path.normalize(__dirname + '/../../App/Lib/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({testAction: function(){return this.fetch("index:test")}})')

    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('home:index:test').then(function(content){
        assert.equal(content, 'welefen');
        done();
      })
    })
  })
  it('instance.action("test:test")', function(done){
    var filepath = path.normalize(__dirname + '/../../App/View/Home/test_test.html');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'test:test')
    
    var filepath = path.normalize(__dirname + '/../../App/Lib/Controller/Home/TestController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({testAction: function(){return this.fetch("test:test")}})')


    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('test:test').then(function(content){
        assert.equal(content, 'test:test');
        done();
      })
    })
  })
  it('instance.action("test1:other")', function(done){
    
    var filepath = path.normalize(__dirname + '/../../App/Lib/Controller/Home/Test1Controller.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({otherAction: function(name, value){return {name: name, value: value};}})')


    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('test1:other', ['name', 'value']).then(function(content){
        //console.log(content, 'welefen')
        assert.deepEqual(content, {"name":"name","value":"value"});
        //console.log(content)
        done();
      }).catch(function(err){
        console.log(err)
      })
    })
  })
  it('instance.action("test2:other")', function(done){
    
    var filepath = path.normalize(__dirname + '/../../App/Lib/Controller/Home/Test2Controller.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({otherAction: function(name){return {name: name};}})')


    promise.then(function(instance){
      instance.http.group = 'home';
      instance.action('test2:other', 'welefen').then(function(content){
        //console.log(content, 'welefen')
        assert.deepEqual(content, {"name":"welefen"});
        //console.log(content)
        done();
      }).catch(function(err){
        console.log(err)
      })
    })
  })



  it('instance.jsonp()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res.setHeader = function(name, value){
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'application/json; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.jsonp();
    })
  })
  it('instance.jsonp({name: "welefen"})', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(content, encoding){
        assert.equal(content, '{"name":"welefen"}');
        assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.jsonp({name: 'welefen'});
    })
  })
  it('instance.jsonp() with callback', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.get.callback = 'xxxx';
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, 'xxxx()');
        assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        delete instance.http.get.callback;
        done();
      }
      instance.jsonp();
    })
  })
  it('instance.jsonp({name: "welefen"}) with callback', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.get.callback = 'xxxx';
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, 'xxxx({"name":"welefen"})');
        //assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        delete instance.http.get.callback;
        done();
      }
      instance.jsonp({name: "welefen"});
    })
  })
  it('instance.jsonp({name: "welefen"}) with callback 1', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.get.callback = 'xxxx~~~';
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, 'xxxx({"name":"welefen"})');
        //assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        delete instance.http.get.callback;
        done();
      }
      instance.jsonp({name: "welefen"});
    })
  })
  it('instance.jsonp({name: "welefen"}) with callback 2', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.get.callback = '~~~';
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, '{"name":"welefen"}');
        //assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        delete instance.http.get.callback;
        done();
      }
      instance.jsonp({name: "welefen"});
    })
  })


  it('instance.json()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        //console.log(name, value)
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'application/json; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.json();
    })
  })
  it('instance.json({name: "welefen"})', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, '{"name":"welefen"}');
        assert.equal(encoding, 'utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.json({name: "welefen"});
    })
  })
  it('instance.status()', function(done){
    promise.then(function(instance){
      instance.status();
      var status = instance.http.res.statusCode;
      assert.equal(status, 404);
      done();
    })
  })
  it('instance.status(500)', function(done){
    promise.then(function(instance){
      instance.http.res._header = '';
      instance.status(500);
      var status = instance.http.res.statusCode;
      assert.equal(status, 500);
      done();
    })
  })
  it('instance.status(500) headersSent', function(done){
    promise.then(function(instance){
      instance.http.res._header = {};
      instance.http.res.statusCode = 200;
      instance.status(500);
      var status = instance.http.res.statusCode;
      //console.log(status)
      assert.equal(status, 200);
      done();
    })
  })
  it('instance.deny()', function(done){
    promise.then(function(instance){
      instance.http.res._header = '';
      instance.deny();
      var status = instance.http.res.statusCode;
      assert.equal(status, 403);
      done();
    })
  })
  it('instance.deny(401)', function(done){
    promise.then(function(instance){
      instance.http.res._header = '';
      instance.deny(401);
      var status = instance.http.res.statusCode;
      assert.equal(status, 401);
      done();
    })
  })
  it('instance.deny(401) headersSent', function(done){
    promise.then(function(instance){
      instance.http.res._header = {};
      instance.http.res.statusCode = 200;
      instance.deny(401);
      var status = instance.http.res.statusCode;
      assert.equal(status, 200);
      done();
    })
  })
  it('instance.echo()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        //console.log(name, value)
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.echo();
    })
  })
  it('instance.echo(undefined)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        //console.log(name, value)
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.echo(undefined);
    })
  })
  it('instance.echo("name")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, 'name');
        //assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.echo('name');
    })
  })
  it('instance.echo({name: "welefen"})', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, '{"name":"welefen"}');
        //assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.echo({name: 'welefen'});
    })
  })
  it('instance.echo(["name", "welefen"])', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(content, '["name","welefen"]');
        //assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.echo(["name", "welefen"]);
    })
  })
  it('instance.echo(buffer)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(isBuffer(content), true);
        //assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.write = fn;
        done();
      }
      instance.echo(new Buffer(120));
    })
  })
  it('instance.echo(buffer)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.write = function(content, encoding){
        //console.log(content, encoding)
        assert.equal(isBuffer(content), true);
        //assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.write = fn;
        C('auto_send_content_type', true)
        done();
      }
      C('auto_send_content_type', false)
      instance.echo(new Buffer(120));
    })
  })
  it('instance.end()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.end;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.end = function(){
        instance.http.res.end = fn;
        done();
      }
      instance.end();
    })
  })
  it('instance.type()', function(done){
    promise.then(function(instance){
      instance.type();
      done();
    })
  })
  it('instance.type("js")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        assert.equal(name, 'Content-Type');
        //console.log(value)
        assert.equal(value, 'application/javascript; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.type('js');
    })
  })
  it('instance.type("png")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        //console.log(value)
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'image/png; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.type('png');
    })
  })
  it('instance.type("name/test")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        //console.log(value)
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'name/test; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.type('name/test');
    })
  })
  it('instance.type("xxxfasdfasdfasdfxxx")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        //console.log(value)
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'application/octet-stream; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.type('xxxfasdfasdfasdfxxx');
    })
  })
  it('instance.type("text/html") with charset', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        //console.log(value)
        assert.equal(name, 'Content-Type');
        assert.equal(value, 'text/html; charset=utf8');
        instance.http.res.setHeader = fn;
        done();
      }
      instance.type('text/html; charset=utf8');
    })
  })



  it('instance.download(file)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        if (name === 'Content-Type') {
          assert.equal(value, 'application/javascript; charset=utf8');
        };
        if (name === 'Content-Disposition') {
          assert.equal(value, 'attachment; filename="Controller.js"');
          instance.http.res.setHeader = fn;
          done();
        }
      }
      instance.download(path.normalize(__filename));
    })
  })
  it('instance.download(file, type)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      instance.http.res.setHeader = function(name, value){
        if (name === 'Content-Type') {
          //console.log(value)
          assert.equal(value, 'image/png; charset=utf8');
        };
        if (name === 'Content-Disposition') {
          assert.equal(value, 'attachment; filename="Controller.js"');
          instance.http.res.setHeader = fn;
          done();
        }
      }
      instance.download(path.normalize(__filename), 'png');
    })
  })
  it('instance.download(file, type)', function(done){
    promise.then(function(instance){
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      var fn = instance.http.res.setHeader;
      instance.http.res.setHeader = function(name, value){
        if (name === 'Content-Type') {
          //console.log(value)
          assert.equal(value, 'png/xxx; charset=utf8');
        };
        if (name === 'Content-Disposition') {
          assert.equal(value, 'attachment; filename="Controller.js"');
          instance.http.res.setHeader = fn;
          done();
        }
      }
      instance.download(path.normalize(__filename), 'png/xxx');
    })
  })
  it('instance.download(file, filename)', function(done){
    promise.then(function(instance){
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      var fn = instance.http.res.setHeader;
      instance.http.res.setHeader = function(name, value){
        if (name === 'Content-Type') {
          //console.log(value)
          assert.equal(value, 'application/javascript; charset=utf8');
        };
        if (name === 'Content-Disposition') {
          //console.log(value)
          assert.equal(value, 'attachment; filename="a.png"');
          instance.http.res.setHeader = fn;
          done();
        }
      }
      instance.download(path.normalize(__filename), 'a.png');
    })
  })
  it('instance.download(file, type, filename)', function(done){
    promise.then(function(instance){
      instance.http.res._header = '';
      instance.http.cthIsSend = false;
      var fn = instance.http.res.setHeader;
      instance.http.res.setHeader = function(name, value){
        if (name === 'Content-Type') {
          //console.log(value)
          assert.equal(value, 'image/png; charset=utf8');
        };
        if (name === 'Content-Disposition') {
          //console.log(value)
          assert.equal(value, 'attachment; filename="a.png"');
          instance.http.res.setHeader = fn;
          done();
        }
      }
      instance.download(path.normalize(__filename), 'png', 'a.png');
    })
  })



  it('instance.success()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        assert.equal(name, '{"errno":0,"errmsg":""}');
        instance.http.res.write = fn;
        done();
      }
      instance.success();
    })
  })
  it('instance.success(data)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{"errno":0,"errmsg":"","data":{"name":"welefen"}}');
        instance.http.res.write = fn;
        done();
      }
      instance.success({name: "welefen"});
    })
  })
  it('instance.error()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{"errno":1000,"errmsg":"error"}');
        instance.http.res.write = fn;
        done();
      }
      instance.error();
    })
  })
  it('instance.error(200)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{"errno":200,"errmsg":"error"}');
        instance.http.res.write = fn;
        done();
      }
      instance.error(200);
    })
  })
  it('instance.error(200, "msg")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{"errno":200,"errmsg":"msg"}');
        instance.http.res.write = fn;
        done();
      }
      instance.error(200, 'msg');
    })
  })
  it('instance.error(200, "msg", data)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{"errno":200,"errmsg":"msg","data":{"name":"welefen"}}');
        instance.http.res.write = fn;
        done();
      }
      instance.error(200, 'msg', {name: "welefen"});
    })
  })
  it('instance.error({})', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{}');
        instance.http.res.write = fn;
        done();
      }
      instance.error({});
    })
  })
  it('instance.error({errno:1,errmsg: "msg"})', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{"errno":1,"errmsg":"msg"}');
        instance.http.res.write = fn;
        done();
      }
      instance.error({errno:1,errmsg: "msg"});
    })
  })
  it('instance.error({errno:1,errmsg: "msg"}, data)', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.write;
      instance.http.res.write = function(name, value){
        //console.log(name)
        assert.equal(name, '{"errno":1,"errmsg":"msg","data":{"name":"welefen"}}');
        instance.http.res.write = fn;
        done();
      }
      instance.error({errno:1,errmsg: "msg"}, {name: "welefen"});
    })
  })
  it('instance.sendTime()', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.res.headersSent = false;
      instance.http.res.setHeader = function(name, value){
        assert.equal(name, 'X-EXEC-TIME');
        //console.log(/^\d+ms$/.test(value))
        assert.equal(/^\d+ms$/.test(value), true);
        instance.http.res.setHeader = fn;
        done();
      }
      instance.sendTime();
    })
  })
  it('instance.sendTime("test")', function(done){
    promise.then(function(instance){
      var fn = instance.http.res.setHeader;
      instance.http.res._header = '';
      instance.http.res.headersSent = false;
      instance.http.res.setHeader = function(name, value){
        assert.equal(name, 'X-test');
        //console.log(/^\d+ms$/.test(value))
        assert.equal(/^\d+ms$/.test(value), true);
        instance.http.res.setHeader = fn;
        done();
      }
      instance.sendTime('test');
    })
  })
  it('instance.filter(10, "id")', function(done){
    promise.then(function(instance){
      var result = instance.filter(10, 'id');
      assert.equal(result, 10);
      done();
    })
  })
  it('instance.filter(10, "in", [])', function(done){
    promise.then(function(instance){
      var result = instance.filter(10, 'in', [11, 12]);
      assert.equal(result, '');
      done();
    })
  })
  it('instance.valid(10, "int")', function(done){
    promise.then(function(instance){
      var result = instance.valid('10', "int");
      //console.log(result)
      assert.equal(result, true);
      done();
    })
  })
  it('instance.valid([])', function(done){
    promise.then(function(instance){
      var data = [{
        name: 'id',
        value: '10',
        valid: 'int'
      }]
      var result = instance.valid(data);
      assert.deepEqual(result, {});
      done();
    })
  })
  it('instance.valid([]) 1', function(done){
    promise.then(function(instance){
      var data = [{
        name: 'id',
        value: '10ww',
        valid: 'int',
        msg: 'id is not valid'
      }]
      var result = instance.valid(data);
      assert.deepEqual(result, {id: 'id is not valid'});
      done();
    })
  })
  it('closeDb', function(done){
    promise.then(function(instance){
      instance.closeDb();
      done();
    })
  })
  it('set,ok,fail is function', function(){
    promise.then(function(instance){
      assert.equal(isFunction(instance.set), true)
      assert.equal(isFunction(instance.ok), true)
      assert.equal(isFunction(instance.fail), true)
    })
  })
})

//删除缓存文件
//异步删除，不能在after里操作
describe('rm tmp files', function(){
  it('rm tmp files', function(done){
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
})
