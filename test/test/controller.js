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
  it('instance.isWebSocket()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isWebSocket(), false);
      done();
    })
  })
  it('instance.isCli()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isCli(), true);
      done();
    })
  })
  it('instance.isJsonp()', function(done){
    promise.then(function(instance){
      assert.equal(instance.isJsonp(), false);
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
  it('instance.cookie()', function(done){
    promise.then(function(instance){
      //console.log(JSON.stringify(instance.cookie()));
      assert.equal(JSON.stringify(instance.cookie()), '{"Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1":"1380544681","bdshare_firstime":"1398851688467","visit_count":"5","thinkjs":"qSK6dvvHE1nDqzeMBOnIiw4LlbPdYGMB","Hm_lvt_3a35dfea7bd1bb657c1ecd619a3c6cdd":"1404201763","Hm_lpvt_3a35dfea7bd1bb657c1ecd619a3c6cdd":"1404357406"}');
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
      assert.equal(instance.cookie('Hm_lvt_c4ee723718ec2e065e4cb1fb8d84bea1'), '1380544681');
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



})
