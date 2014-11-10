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


describe('View', function(){
  var httpInstance;
  var promise = instance.then(function(http){
    http.group = 'Home';
    http.controller = 'Index';
    http.action = 'index';
    httpInstance = http;
    return thinkRequire('View')(http);
  })
  describe('init', function(){
    it('tVar, http', function(done){
      promise.then(function(instance){
        assert.deepEqual(instance.tVar, {})
        assert.equal(instance.http, httpInstance)
        done();
      })
    })
  })
  describe('assign', function(){
    it('assign empty', function(done){
      promise.then(function(instance){
        assert.deepEqual(instance.assign(), {})
        done();
      })
    })
    it('assign name, value', function(done){
      promise.then(function(instance){
        instance.assign('name', 'welefen');
        assert.deepEqual(instance.tVar, {name: 'welefen'});
        done();
      })
    })
    it('assign obj', function(done){
      promise.then(function(instance){
        instance.assign({name: 'welefen'});
        assert.deepEqual(instance.tVar, {name: 'welefen'});
        done();
      })
    })
    it('assign get', function(done){
      promise.then(function(instance){
        assert.deepEqual(instance.assign('name'), 'welefen');
        done();
      })
    })
  })
  describe('fetch', function(){
    it('fetch empty file, file not exist', function(done){
      promise.then(function(instance){
        return instance.fetch();
      }).catch(function(err){
        assert.equal(err.message.indexOf("can't find template file") > -1, true)
        done();
      })
    })
    it('fetch empty file, file exist', function(done){

      var filepath = path.normalize(__dirname + '/../../App/View/Home/index_index.html');
      mkdir(path.dirname(filepath));
      fs.writeFileSync(filepath, 'hello, thinkjs!')

      promise.then(function(instance){
        return instance.fetch();
      }).then(function(content){
        assert.equal(content, "hello, thinkjs!");
        done();
      })
    })
    it('fetch file', function(done){

      var filepath = path.normalize(__dirname + '/../../App/View/Home/index_index.html');
      mkdir(path.dirname(filepath));
      fs.writeFileSync(filepath, 'hello, thinkjs!')

      promise.then(function(instance){
        return instance.fetch(filepath);
      }).then(function(content){
        assert.equal(content, "hello, thinkjs!");
        done();
      })
    })
    it('fetch file, with variable', function(done){

      var filepath = path.normalize(__dirname + '/../../App/View/Home/index_index.html');
      mkdir(path.dirname(filepath));
      fs.writeFileSync(filepath, '<%-name%>')

      promise.then(function(instance){
        instance.assign('name', 'welefen')
        return instance.fetch(filepath);
      }).then(function(content){
        assert.equal(content, "welefen");
        done();
      })
    })
    it('fetch file, with promise variable', function(done){

      var filepath = path.normalize(__dirname + '/../../App/View/Home/index_index.html');
      mkdir(path.dirname(filepath));
      fs.writeFileSync(filepath, '<%-name%>')

      promise.then(function(instance){
        instance.assign('name', getPromise('welefen'))
        return instance.fetch(filepath);
      }).then(function(content){
        assert.equal(content, "welefen");
        done();
      })
    })
    it('fetch file, with promise variable', function(done){

      var filepath = path.normalize(__dirname + '/../../App/View/Home/index_index.html');
      mkdir(path.dirname(filepath));
      fs.writeFileSync(filepath, '<%-name%><%-name2%>')

      promise.then(function(instance){
        instance.assign('name', getPromise('welefen'));
        var p1 = getPromise().then(function(){
          instance.assign('name2', 'welefen333');
        })
        instance.assign('name1', p1)
        return instance.fetch(filepath);
      }).then(function(content){
        assert.equal(content, "welefenwelefen333");
        done();
      })
    })
    it('fetch file, without view Path', function(done){

      var filepath = path.normalize(__dirname + '/../../App/View/Home/index_index.html');
      global.VIEW_PATH = path.normalize(__dirname + '/../../App/View');
      mkdir(path.dirname(filepath));
      fs.writeFileSync(filepath, 'hello, thinkjs!')

      promise.then(function(instance){
        return instance.fetch('Home/index_index.html');
      }).then(function(content){
        assert.equal(content, "hello, thinkjs!");
        done();
      })
    })
  })

  describe('render', function(){
    it('render empty content', function(done){
      promise.then(function(instance){
        var fn = httpInstance.res.setHeader;
        httpInstance.res.setHeader = function(name, value){
          if (name === 'Content-Type') {
            assert.equal(value, 'text/html; charset=utf-8')
          };
           httpInstance.res.setHeader = fn;
          done();
        }
        return instance.render();
      })
    })
    it('render, content-type send', function(done){
      promise.then(function(instance){
        httpInstance.cthIsSend = true;
        return instance.render();
      }).then(function(){
        done();
      })
    })
    it('render, show exec time', function(done){
      promise.then(function(instance){
        var fn = httpInstance.res.setHeader;
        httpInstance.res._header = '';
        httpInstance.res.setHeader = function(name, value){
          assert.equal(name, 'X-Exec-Time');
          httpInstance.res.setHeader = fn;
          C('show_exec_time', false);
          done();
        }
        C('show_exec_time', true);
        return instance.render();
      })
    })
  })
  describe('display', function(){
    it('display', function(done){
      promise.then(function(instance){
        var fn = httpInstance.res.write;
        httpInstance.res.write = function(content){
          assert.equal(content, 'hello, thinkjs!');
          httpInstance.res.write = fn;
          done();
        }
        return instance.display()
      })
    })
    it('display', function(done){
      promise.then(function(instance){
        var fn = console.error;
        console.error = function(content){
          assert.equal(content.indexOf("can't find template file") > -1, true);
          console.error = fn;
          done();
        }
        return instance.display('index:test')
      })
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