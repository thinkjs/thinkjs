var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs')

global.APP_PATH = path.normalize(__dirname + '/../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));


var MysqlSocket = thinkRequire('MysqlSocket');
var Db = thinkRequire('Db');

var clearRequireCache = function(){
  for(var name in require.cache){
    delete require.cache[name];
  }
}

describe('before', function(){
  it('before', function(){
    muk(MysqlSocket.prototype, 'query', function(sql){
      if (sql === 'SHOW COLUMNS FROM `think_friend`') {
        var data = [{"Field":"id","Type":"int(11) unsigned", "Default":null,"Extra":""},{"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},{"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},{"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},{"Field":"md5","Type":"varchar(255)","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"width","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"height","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"pic_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"view_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"content","Type":"text","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"date","Type":"int(11)","Null":"NO","Key":"MUL","Default":null,"Extra":""},{"Field":"is_hide","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"0","Extra":""},{"Field":"is_safe","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"1","Extra":""}];
        return getPromise(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_cate`') {
        var data = [{"Field":"wid","Type":"int(11) unsigned", "Null":"NO","Key":"PRI", "Default":null,"Extra":""},{"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},{"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},{"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},{"Field":"md5","Type":"varchar(255)","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"width","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"height","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"pic_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"view_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"content","Type":"text","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"date","Type":"int(11)","Null":"NO","Key":"MUL","Default":null,"Extra":""},{"Field":"is_hide","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"0","Extra":""},{"Field":"is_safe","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"1","Extra":""}];
        return getPromise(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_tag`') {
        var data = [{"Field":"wid","Type":"int(11) unsigned", "Extra":""},{"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},{"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},{"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},{"Field":"md5","Type":"varchar(255)","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"width","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"height","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"pic_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"view_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"content","Type":"text","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"date","Type":"int(11)","Null":"NO","Key":"MUL","Default":null,"Extra":""},{"Field":"is_hide","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"0","Extra":""},{"Field":"is_safe","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"1","Extra":""}];
        return getPromise(data);
      }else if(sql.indexOf('SHOW COLUMNS ') > -1){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},{"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},{"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},{"Field":"md5","Type":"varchar(255)","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"width","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"height","Type":"int(11)","Null":"NO","Key":"","Default":"0","Extra":""},{"Field":"pic_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"view_nums","Type":"int(11)","Null":"NO","Key":"MUL","Default":"0","Extra":""},{"Field":"content","Type":"text","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"date","Type":"int(11)","Null":"NO","Key":"MUL","Default":null,"Extra":""},{"Field":"is_hide","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"0","Extra":""},{"Field":"is_safe","Type":"tinyint(11)","Null":"YES","Key":"MUL","Default":"1","Extra":""}];
        return getPromise(data);
      }
      var data = [{"id":7565,"title":"米兰达·可儿干练服装写真大片","cate_id":1,"cate_no":0,"md5":"27e562c50195153d89c52072bd4c8d5a","width":936,"height":1177,"pic_nums":11,"view_nums":1965,"content":"","date":20140526,"is_hide":0,"is_safe":0},{"id":7564,"title":"[Beautyleg]2014.05.21 No.977 Cindy","cate_id":2,"cate_no":977,"md5":"e31b3202f3cefe9944fb0e086064694f","width":1600,"height":2400,"pic_nums":30,"view_nums":1558,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7563,"title":"[DISI第四印象]2014.05.21 NO.281","cate_id":7,"cate_no":281,"md5":"ea455be2cab6813964543662b462a550","width":960,"height":640,"pic_nums":30,"view_nums":2335,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7562,"title":"[PANS写真]2014-05-20 NO.242 小倩 套图","cate_id":6,"cate_no":242,"md5":"de775e0785c379ad853b2a299e4736cd","width":1600,"height":2397,"pic_nums":30,"view_nums":2013,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7561,"title":"[ROSI写真]2014.05.20 NO.896","cate_id":3,"cate_no":896,"md5":"65e4a012a123190184a07d87c21e9dec","width":1600,"height":1067,"pic_nums":30,"view_nums":1425,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7560,"title":"[ROSI写真]2014.05.21 NO.897","cate_id":3,"cate_no":897,"md5":"51477ddac8a1d67d30f83da66e0b9ff5","width":1600,"height":1067,"pic_nums":22,"view_nums":1433,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7559,"title":"[ROSI写真]2014.05.22 NO.898","cate_id":3,"cate_no":898,"md5":"a74d4a187ae126b1446503da309b56c9","width":796,"height":531,"pic_nums":30,"view_nums":1994,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7558,"title":"[ru1mm写真] 2014-05-20 NO.151","cate_id":17,"cate_no":151,"md5":"4818e310b0c983e17ae87414a808879d","width":1200,"height":1800,"pic_nums":30,"view_nums":2035,"content":"","date":20140524,"is_hide":0,"is_safe":0},{"id":7557,"title":"[ru1mm写真] 2014-05-22 NO.152","cate_id":17,"cate_no":152,"md5":"af8b033373b1526bd8a28053f065359f","width":1600,"height":1067,"pic_nums":30,"view_nums":1118,"content":"","date":20140524,"is_hide":0,"is_safe":0}]
      return getPromise(data);
    })
  })
})

describe('Db', function(){
  describe('Db.parseConfig', function(){
    // it('empty config', function(){
    //   var config = Db.parseConfig();
    //   assert.deepEqual(config, {"type":"mysql","user":"root","password":"","host":"127.0.0.1","port":"","database":"","charset":"utf-8", "rw_separate": false, "master_num": 1, "slave_no": undefined})
    // })
    // it('change type config', function(){
    //   var config = Db.parseConfig({db_type: 'mongodb'});
    //   assert.deepEqual(config, {"type":"mongodb","user":"root","password":"","host":"127.0.0.1","port":"","database":"","charset":"utf-8", "rw_separate": false, "master_num": 1, "slave_no": undefined})
    // })
  })
  describe('init', function(){
    it('init', function(){
      assert.equal(Db().init(), undefined);
    })
  })
})

describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})