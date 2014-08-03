var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

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
req.url = '/user';
var res = new http.ServerResponse(req);
var instance = Http(req, res).run();


var RestController = thinkRequire('RestController');
var MysqlSocket = thinkRequire('MysqlSocket');
var MysqlDb = thinkRequire('MysqlDb');


describe('before', function(){
  it('before', function(done){
    C('db_prefix', 'meinv_')
    muk(RestController.prototype, 'success', function(data){
      return data;
    })
    muk(RestController.prototype, 'error', function(data){
      return getPromise(data, true);
    });
    muk(MysqlSocket.prototype, 'query', function(sql){
      if(sql.indexOf('SHOW COLUMNS ') > -1){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},{"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},{"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},{"Field":"md5","Type":"varchar(255)","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"width","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"height","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"pic_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"view_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"content","Type":"text","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"date","Type":"int(11)","Null":"NO","Key":"MUL","Default":null,"Extra":""},{"Field":"is_hide","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"0","Extra":""},{"Field":"is_safe","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"1","Extra":""}];
        return getPromise(data);
      }else if (sql.indexOf('SELECT ') > -1) {
        var data = [{"id":7565,"title":"米兰达·可儿干练服装写真大片","cate_id":1,"cate_no":0,"md5":"27e562c50195153d89c52072bd4c8d5a","width":936,"height":1177,"pic_nums":11,"view_nums":1965,"content":"","date":20140526,"is_hide":0,"is_safe":0},{"id":7564,"title":"[Beautyleg]2014.05.21 No.977 Cindy","cate_id":2,"cate_no":977,"md5":"e31b3202f3cefe9944fb0e086064694f","width":1600,"height":2400,"pic_nums":30,"view_nums":1558,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7563,"title":"[DISI第四印象]2014.05.21 NO.281","cate_id":7,"cate_no":281,"md5":"ea455be2cab6813964543662b462a550","width":960,"height":640,"pic_nums":30,"view_nums":2335,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7562,"title":"[PANS写真]2014-05-20 NO.242 小倩 套图","cate_id":6,"cate_no":242,"md5":"de775e0785c379ad853b2a299e4736cd","width":1600,"height":2397,"pic_nums":30,"view_nums":2013,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7561,"title":"[ROSI写真]2014.05.20 NO.896","cate_id":3,"cate_no":896,"md5":"65e4a012a123190184a07d87c21e9dec","width":1600,"height":1067,"pic_nums":30,"view_nums":1425,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7560,"title":"[ROSI写真]2014.05.21 NO.897","cate_id":3,"cate_no":897,"md5":"51477ddac8a1d67d30f83da66e0b9ff5","width":1600,"height":1067,"pic_nums":22,"view_nums":1433,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7559,"title":"[ROSI写真]2014.05.22 NO.898","cate_id":3,"cate_no":898,"md5":"a74d4a187ae126b1446503da309b56c9","width":796,"height":531,"pic_nums":30,"view_nums":1994,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7558,"title":"[ru1mm写真] 2014-05-20 NO.151","cate_id":17,"cate_no":151,"md5":"4818e310b0c983e17ae87414a808879d","width":1200,"height":1800,"pic_nums":30,"view_nums":2035,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7557,"title":"[ru1mm写真] 2014-05-22 NO.152","cate_id":17,"cate_no":152,"md5":"af8b033373b1526bd8a28053f065359f","width":1600,"height":1067,"pic_nums":30,"view_nums":1118,"content":"","date":20140524,"is_hide":0,"is_safe":0}]
        return getPromise(data);
      }else if(sql.indexOf('INSERT INTO ') > -1){
        return getPromise({insertId: 100, affectedRows: 1});
      }else if (sql.indexOf('DELETE ') > -1) {
        return getPromise({affectedRows: 1});
      }else if(sql.indexOf('UPDATE ') > -1){
        return getPromise({affectedRows: 1});
      }else{
        return getPromise([]);
      }
    })
    done();
  })
})


describe('Restful', function(){
  C('url_route_rules', [
    [/^(\w+)(?:\/(\d+))?/,  'RESTFUL'], 
  ]);
  var httpInstance;
  function getTestPromise(obj){
    return instance.then(function(http){
      for(var name in obj){
        http[name] = obj[name];
      }
      httpInstance = http;
       return B('CheckRoute', http);
    }).then(function(){
      return thinkRequire('RestController')(httpInstance);
    })
  }
  it('Restful get list success', function(done){
    getTestPromise({
      pathname: 'user',
      method: 'GET'
    }).then(function(instance){
      assert.equal(instance.resource, 'user');
      return instance.getAction();
    }).then(function(data){
      assert.equal(data.length, 9);
      done();
    }).catch(function(err){
      console.log(err.stack);
    })
  })
  it('Restful get list fail', function(done){
    getTestPromise({
      pathname: 'user',
      method: 'GET'
    }).then(function(instance){
      assert.equal(instance.resource, 'user');
      fn = MysqlDb.prototype.query;
      MysqlDb.prototype.query = function(sql){
        return getPromise(new Error('getListError'), true);
      }
      return instance.getAction();
    }).catch(function(err){
      assert.equal(err, 'getListError');
      MysqlDb.prototype.query = fn;
      done();
    })
  })
  it('Restful get item success', function(done){
    getTestPromise({
      pathname: 'user/1111',
      method: 'GET'
    }).then(function(instance){
      assert.equal(instance.resource, 'user');
      assert.equal(instance.id, 1111);
      return instance.getAction();
    }).then(function(data){
      assert.equal(data.id, 7565);
      done();
    }).catch(function(err){
      console.log(err);
    })
  })
  it('Restful get item fail', function(done){
    getTestPromise({
      pathname: 'user/1111',
      method: 'GET'
    }).then(function(instance){
      assert.equal(instance.resource, 'user');
      assert.equal(instance.id, 1111);
      fn = MysqlDb.prototype.query;
      MysqlDb.prototype.query = function(sql){
        return getPromise(new Error('getListError'), true);
      }
      return instance.getAction();
    }).catch(function(err){
      assert.equal(err, 'getListError');
      MysqlDb.prototype.query = fn;
      done();
    })
  })
  var controllerInstance;
  it('Restful post item success', function(done){
    getTestPromise({
      pathname: 'user',
      method: 'POST',
      post: {
        title: 'welefentest'
      }
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.deepEqual(httpInstance.post, {title: 'welefentest'})
      return instance.postAction();
    }).then(function(data){
      var sql = controllerInstance.model.getLastSql();
      assert.equal(sql, "INSERT INTO `meinv_user` (`title`) VALUES('welefentest')");
      //assert.equal(data.id, 7565);
      done();
    }).catch(function(err){
      console.log(err);
    })
  })
  it('Restful post item success 1', function(done){
    getTestPromise({
      pathname: 'user',
      method: 'POST',
      post: {
        title: 'welefentest',
        test: 'xxxx'
      }
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.deepEqual(httpInstance.post, {title: 'welefentest', test: 'xxxx'})
      return instance.postAction();
    }).then(function(data){
      var sql = controllerInstance.model.getLastSql();
      assert.equal(sql, "INSERT INTO `meinv_user` (`title`) VALUES('welefentest')");
      assert.equal(data.id, 100);
      done();
    }).catch(function(err){
      console.log(err);
    })
  })
  it('Restful post data empty', function(done){
    getTestPromise({
      pathname: 'user',
      method: 'POST',
      post: {}
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.deepEqual(httpInstance.post, {})
      return instance.postAction();
    }).catch(function(err){
      assert.equal(err, 'data is empty')
      done();
    })
  })
  it('Restful delete action params error', function(done){
    getTestPromise({
      pathname: 'user',
      method: 'DELETE',
      post: {},
      get: {}
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.deepEqual(httpInstance.post, {})
      return instance.deleteAction();
    }).catch(function(err){
      assert.equal(err, 'params error')
      done();
    })
  })
  it('Restful delete action', function(done){
    getTestPromise({
      pathname: 'user/1111',
      method: 'DELETE',
      post: {}
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.equal(instance.id, 1111);
      assert.deepEqual(httpInstance.post, {})
      return instance.deleteAction();
    }).then(function(data){
      var sql = controllerInstance.model.getLastSql();
      assert.equal(sql, "DELETE FROM `meinv_user` WHERE ( `id` = 1111 )");
      assert.deepEqual(data, {affectedRows: 1})
      done();
    }).catch(function(err){
      console.log(err)
      done();
    })
  })
  it('Restful delete error', function(done){
    getTestPromise({
      pathname: 'user/1111',
      method: 'DELETE'
    }).then(function(instance){
      assert.equal(instance.resource, 'user');
      assert.equal(instance.id, 1111);
      fn = MysqlDb.prototype.execute;
      MysqlDb.prototype.execute = function(sql){
        return getPromise(new Error('getListError'), true);
      }
      return instance.deleteAction();
    }).catch(function(err){
      assert.equal(err, 'getListError');
      MysqlDb.prototype.execute = fn;
      done();
    })
  })
  it('Restful put action params error', function(done){
    getTestPromise({
      pathname: 'user',
      method: 'PUT',
      post: {},
      get: {}
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.deepEqual(httpInstance.post, {})
      return instance.putAction();
    }).catch(function(err){
      assert.equal(err, 'params error')
      done();
    })
  })
  it('Restful put action data empty', function(done){
    getTestPromise({
      pathname: 'user/1111',
      method: 'PUT',
      post: {},
      get: {}
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.equal(instance.id, 1111);
      assert.deepEqual(httpInstance.post, {})
      return instance.putAction();
    }).catch(function(err){
      assert.equal(err, 'data is empty')
      done();
    })
  })
  it('Restful put action', function(done){
    getTestPromise({
      pathname: 'user/1111',
      method: 'PUT',
      post: {title: 'welefen'},
      get: {}
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.equal(instance.id, 1111);
      assert.deepEqual(httpInstance.post, {title: 'welefen'})
      return instance.putAction();
    }).then(function(data){
      var sql = controllerInstance.model.getLastSql();
      assert.equal(sql, "UPDATE `meinv_user` SET `title`='welefen' WHERE ( `id` = 1111 )");
      assert.deepEqual(data, {affectedRows: 1})
      done();
    })
  })
  it('Restful xxxx method', function(done){
    getTestPromise({
      pathname: 'user/1111',
      method: 'XXXX',
      post: {title: 'welefen'},
      get: {}
    }).then(function(instance){
      controllerInstance = instance;
      assert.equal(instance.resource, 'user');
      assert.equal(instance.id, 1111);
      assert.deepEqual(httpInstance.post, {title: 'welefen'})
      return instance.__call('xxxx');
    }).catch(function(err){
      assert.equal(err, "action `xxxx` is not allowed");
      done();
    })
  })



})

describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})