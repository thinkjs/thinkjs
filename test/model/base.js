'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();
instance.tablePrefix = 'think_';

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var Base;

describe('model/base.js', function(){
  var instance = null, data;
  it('before', function(){
    //console.log('base.js')
    //console.log(path.resolve(__dirname, '../../lib/model/base.js'));

    Base = think.safeRequire(path.resolve(__dirname, '../../lib/model/base.js'));
    var mysqlSocket = think.adapter('socket', 'mysql');
    var config = think.extend({}, think.config('db'), {prefix: 'think_'});
    instance = new Base('user', config);
    var tagCacheKeyNum = 0;
    muk(mysqlSocket.prototype, 'query', function(sql){

      if (sql === 'SHOW COLUMNS FROM `think_friend`') {
        data = [
          {"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return Promise.resolve(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_cate`') {
        data = [
          {"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return Promise.resolve(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_tag`') {
        data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return Promise.resolve(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_user`') {
        data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return Promise.resolve(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_type`') {
        data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
          {"Field":"flo","Type":"float(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"is_show","Type":"bool","Null":"NO","Key":"MUL","Default":null,"Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return Promise.resolve(data);
      }
      else if (sql === 'SHOW COLUMNS FROM `think_hasid`') {
        data = [
          {"Field":"_id","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
          {"Field":"flo","Type":"float(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"is_show","Type":"bool","Null":"NO","Key":"MUL","Default":null,"Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return Promise.resolve(data);
      }
      else if(sql.indexOf('SHOW COLUMNS ') > -1){
        if(sql.indexOf(' AS ') > -1){
          return Promise.reject(new ERROR('columns has can not as'));
        }
        data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":""},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return Promise.resolve(data);
      }else if (sql.indexOf("SELECT * FROM `think_type` WHERE ( `flo` = 0 ) LIMIT 1") > -1) {
        return Promise.resolve([]);
      }else if (sql.indexOf('SELECT COUNT(think_tag.wid) AS thinkjs_count FROM `think_tag` LIMIT 1') > -1) {
        return Promise.resolve([{
          thinkjs_count: 100
        }])
      }else if (sql.indexOf("SELECT `wid` FROM `think_group` LIMIT 2")> -1) {
        return Promise.resolve([
          {"id":7565,"title":"title1","cate_id":1,"cate_no":0},
          {"id":7564,"title":"title2","cate_id":2,"cate_no":977}
        ])
      }else if(sql.trim() === 'SELECT * FROM `think_cache_tbl`'){
        ++tagCacheKeyNum;
        return Promise.resolve(['cache1', 'cache2', tagCacheKeyNum]);
      }else if(sql.trim() === "INSERT INTO `think_user` (`title`) VALUES ('test')"){
        return Promise.resolve({
          insertId: 100
        });
      }else if(sql.trim() === "REPLACE INTO `think_user` (`title`) VALUES ('test')"){
        return Promise.resolve({
          insertId: 1000
        });
      }else if(sql.trim() === "SELECT * FROM `think_user` WHERE ( `id` = 897 ) LIMIT 1"){
        return Promise.resolve([]);
      }else if(sql.trim() === "SELECT * FROM `think_user` WHERE ( `id` = 898 ) LIMIT 1"){
        return Promise.resolve([{
          id: 898
        }]);
      }else if(sql.trim() === "INSERT INTO `think_user`(`title`) VALUES ('title1'),('title2')"){
        return Promise.resolve({
          insertId: 565
        })
      }else if(sql.trim() === "REPLACE INTO `think_user`(`title`) VALUES ('title1'),('title2')"){
        return Promise.resolve({
          insertId: 343
        })
      }else if(sql.trim() === "DELETE FROM `think_user` WHERE ( `id` = 1 )"){
        return Promise.resolve({
          affectedRows: 3
        })
      }else if(sql.trim() === "UPDATE `think_user` SET `title`='title1' WHERE ( `id` = 101 )"){
        return Promise.resolve({
          affectedRows: 1
        })
      }else if(sql.trim() === "UPDATE `think_user` SET `title`='title1' WHERE ( `id` = 105 )"){
        return Promise.resolve({
          affectedRows: 1
        })
      }else if(sql.trim() === "UPDATE `think_user` SET `title`='title1' WHERE ( `id` = 102 )"){
        return Promise.resolve({
          affectedRows: 3
        })
      }else if(sql.trim() === "UPDATE `think_cate` SET `title`='title2' WHERE ( `id` = 106 )"){
        return Promise.resolve({
          affectedRows: 4
        })
      }else if(sql.trim() === "UPDATE `think_user` SET `title`=title+10 WHERE ( 1 = 1 )"){
        return Promise.resolve({
          affectedRows: 1
        })
      }else if(sql.trim() === "UPDATE `think_user` SET `title`=title+1 WHERE ( 1 = 1 )"){
        return Promise.resolve({
          affectedRows: 1
        })
      }else if(sql.trim() === "UPDATE `think_user` SET `title`=title-10 WHERE ( 1 = 1 )"){
        return Promise.resolve({
          affectedRows: 1
        })
      }else if(sql.trim() === "UPDATE `think_user` SET `title`=title-1 WHERE ( 1 = 1 )"){
        return Promise.resolve({
          affectedRows: 1
        })
      }else if(sql.trim() === "SELECT * FROM `think_user` WHERE ( `id` = 100 )"){
        return Promise.resolve([{"id":7565,"title":"title1","cate_id":1,"cate_no":0}])
      }else if(sql.trim() === "SELECT * FROM `think_user` WHERE ( `id` = 100 ) LIMIT 1"){
        return Promise.resolve([{"id":7565,"title":"title1","cate_id":1,"cate_no":0}])
      }else if(sql.trim() === "INSERT INTO `think_user` (`wid`,`title`,`cate_id`,`cate_no`) SELECT * FROM `think_tag` WHERE ( `name` = 'test' )"){
        return Promise.resolve({
          insertId: 100
        });
      }else if(sql.trim() === "SELECT COUNT(think_user.id) AS think_count FROM `think_user` WHERE ( `name` = 'test' ) LIMIT 1"){
        return Promise.resolve([{
          think_count: 399
        }])
      }else if(sql.trim() === "SELECT `title` FROM `think_user` WHERE ( `name` = 'welefen' )"){
        return Promise.resolve([{
          title: 'title1'
        }, {
          title: 'title2'
        }])
      }else if(sql.trim() === "SELECT `title` FROM `think_user` WHERE ( `name` = 'welefen' ) LIMIT 1"){
        return Promise.resolve([{
          title: 'title1'
        }])
      }else if(sql.trim() === "SELECT `title`,`cate_no` FROM `think_user` WHERE ( `name` = 'welefen' ) LIMIT 1"){
        return Promise.resolve([{
          title: 'title1',
          cate_no: 1000
        }])
      }else if(sql.trim() === "SELECT `title`,`cate_no` FROM `think_user` WHERE ( `name` = 'welefen' ) LIMIT 3"){
        return Promise.resolve([{
          title: 'title1',
          cate_no: 1000
        },{
          title: 'title2',
          cate_no: 1001
        },{
          title: 'title3',
          cate_no: 1002
        }])
      }else if(sql.trim() === "SELECT COUNT(id) AS think_count FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_count: 40000
        }])
      }else if(sql.trim() === "SELECT COUNT(`id`) AS think_count FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_count: 40000
        }])
      }else if(sql.trim() === "SELECT SUM(id) AS think_sum FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_sum: 1000
        }])
      }else if(sql.trim() === "SELECT SUM(`id`) AS think_sum FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_sum: 1000
        }])
      }else if(sql.trim() === "SELECT MIN(id) AS think_min FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_min: 1000
        }])
      }else if(sql.trim() === "SELECT MIN(`id`) AS think_min FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_min: 1000
        }])
      }else if(sql.trim() === "SELECT MAX(id) AS think_max FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_max: 1000
        }])
      }
      else if(sql.trim() === "SELECT MAX(`id`) AS think_max FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_max: 1000
        }])
      }else if(sql.trim() === "SELECT AVG(id) AS think_avg FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_avg: 1000
        }])
      }
      else if(sql.trim() === "SELECT AVG(`id`) AS think_avg FROM `think_user` LIMIT 1"){
        return Promise.resolve([{
          think_avg: 1000
        }])
      }
      //console.log(sql)
      data = [
        {"id":7565,"title":"title1","cate_id":1,"cate_no":0},
        {"id":7564,"title":"title2","cate_id":2,"cate_no":977},
        {"id":7563,"title":"title3","cate_id":7,"cate_no":281},
        {"id":7562,"title":"title4","cate_id":6,"cate_no":242},
        {"id":7561,"title":"title5","cate_id":3,"cate_no":896},
        {"id":7560,"title":"title6","cate_id":3,"cate_no":897},
        {"id":7559,"title":"title7","cate_id":3,"cate_no":898},
        {"id":7558,"title":"title8","cate_id":17,"cate_no":151},
        {"id":7557,"title":"title9","cate_id":17,"cate_no":152}
      ];
      return Promise.resolve(data);
    })
  });
  it('model, dynamic get module', function(done){
    var model = think.model;
    think.model = function(name, options, module){
      assert.equal(name, 'model');
      assert.equal(module, '');
    };
    var instance = new Base('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.model('model');
    think.model = model;
    done();
  });
  it('getSchema', function(done){
    instance.getSchema().then(function(data){
      assert.deepEqual(data, { wid:{name: 'wid',type: 'int(11) unsigned',required: false,    primary: false,     unique: false,     auto_increment: false },  title:   { name: 'title',     type: 'varchar(255)',     required: false,          primary: false,     unique: true,     auto_increment: false },  cate_id:   { name: 'cate_id',     type: 'tinyint(255)',     required: false,          primary: false,     unique: false,     auto_increment: false },  cate_no:   { name: 'cate_no',     type: 'int(11)',     required: false,          primary: false,     unique: false, auto_increment: false } });
      done();
    }).catch(function(err) {  done(err) })
  });
  it('getSchema, exist', function(done){
    instance.getSchema().then(function(){
      return instance.getSchema();
    }).then(function(data){
      assert.deepEqual(data, { wid:{name: 'wid',type: 'int(11) unsigned',required: false,     primary: false,     unique: false,     auto_increment: false },  title:   { name: 'title',     type: 'varchar(255)',     required: false,          primary: false,     unique: true,     auto_increment: false },  cate_id:   { name: 'cate_id',     type: 'tinyint(255)',     required: false,          primary: false,     unique: false,     auto_increment: false },  cate_no:   { name: 'cate_no',     type: 'int(11)',     required: false,          primary: false,     unique: false, auto_increment: false } });
      done();
    }).catch(function(err) { done(err) })
  });
  it('getSchema, type', function(done){
    return instance.getSchema('think_type').then(function(data){
      assert.deepEqual(data, { wid:  { name: 'wid',    type: 'int(11) unsigned',    required: false,    primary: false,    unique: false,    auto_increment: false }, flo:  { name: 'flo',    type: 'float(255)',    required: false,        primary: false,    unique: true,    auto_increment: false }, is_show:  { name: 'is_show',    type: 'bool',    required: false,        primary: false,    unique: false,    auto_increment: false }, cate_no:  { name: 'cate_no',    type: 'int(11)',    required: false,        primary: false,    unique: false,    auto_increment: false } });
      assert.equal(instance.getLastSql(), 'SHOW COLUMNS FROM `think_type`');
      done();
    }).catch(function(err) { done(err) })
  });
  it('getSchema, change pk', function(done){
    var instance = new Base('tag', think.config('db'));
    instance.tablePrefix = 'think_';
    return instance.getSchema('think_tag').then(function(){
      assert.equal(instance.getLastSql(), 'SHOW COLUMNS FROM `think_tag`');
      assert.equal(instance.pk, 'wid');
      done();
    }).catch(function(err) { done(err) })
  });
  it('getSchema, change pk, getPk', function(done){
    var instance = new Base('tag', think.config('db'));
    instance.tablePrefix = 'think_';
    return instance.getSchema('think_tag').then(function(data){
      return instance.getPk();
    }).then(function(pk){
      //assert.equal(instance.getLastSql(), 'SHOW COLUMNS FROM `think_tag`');
      assert.equal(pk, 'wid');
      done();
    }).catch(function(err) { done(err) })
  });
  it('getUniqueField', function(done){
    var instance = new Base('tag', think.config('db'));
    instance.tablePrefix = 'think_';
    return instance.getUniqueField().then(function(data){
      assert.equal(data, 'title');
      done();
    }).catch(function(err) { done(err) })
  });
  it('getUniqueField, with data', function(done){
    var instance = new Base('tag', think.config('db'));
    instance.tablePrefix = 'think_';
    return instance.getUniqueField({
      title: 'welefen'
    }).then(function(data){
      assert.equal(data, 'title');
      done();
    }).catch(function(err) { done(err) })
  });
  it('getUniqueField, with data, not match', function(done){
    var instance = new Base('tag', think.config('db'));
    instance.tablePrefix = 'think_';
    return instance.getUniqueField({
      title111: 'welefen'
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseType', function(done){
    var instance = new Base('tag', think.config('db')), data1;
    instance.tablePrefix = 'think_';
    instance.schema = {
      id: {type: 'int'},
      bid: {type: 'bigint'},
      cid: {type: 'double'},
      did: {type: 'float'},
      bool: {type: 'bool'},
      name: {type: 'string'},
      name1: {}
    };
    data1 = instance.parseType('id', 10);
    assert.equal(data1, 10);
    data1 = instance.parseType('id');
    assert.equal(data1, 0);
    data1 = instance.parseType('bid', 10);
    assert.equal(data1, 10);
    data1 = instance.parseType('cid', 10.5);
    assert.equal(data1, 10.5);
    data1 = instance.parseType('cid');
    assert.equal(data1, 0.0);
    data1 = instance.parseType('did', 10);
    assert.equal(data1, 10);
    data1 = instance.parseType('bool', 10);
    assert.equal(data1, true);
    data1 = instance.parseType('name', 'www');
    assert.equal(data1, 'www');
    data1 = instance.parseType('name1', 'www');
    assert.equal(data1, 'www');
    done();
  });
  it('build sql', function(done){
    instance.where('id=1').field('name,title').group('name').limit(10).buildSql().then(function(sql){
      assert.equal(sql, '( SELECT `name`,`title` FROM `think_user` WHERE ( id=1 ) GROUP BY `name` LIMIT 10 )')
      done();
    }).catch(function(err) { done(err) })
  });
  it('build sql 2', function(done){
    var instance = new Base('hasid', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.where({_id: 'www'}).field('name,title').group('name').limit(10).buildSql().then(function(sql){
      assert.equal(sql, "( SELECT `name`,`title` FROM `think_hasid` WHERE ( `_id` = 'www' ) GROUP BY `name` LIMIT 10 )");
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseOptions', function(done){
    instance.parseOptions().then(function(options){
      assert.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user' })
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseOptions, has oriOpts', function(done){
    instance.parseOptions({
      where: {
        name: 'welefen'
      }
    }).then(function(options){
      assert.deepEqual(options, { where: { name: 'welefen' },table: 'think_user',tablePrefix: 'think_',model: 'user' })
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseOptions, has oriOpts', function(done){
    instance.parseOptions(1000).then(function(options){
      assert.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user', where: { id: '1000' } })
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseOptions, has alias', function(done){
    instance.alias('a').parseOptions(1000).then(function(options){
      assert.deepEqual(options, { alias: 'a', table: 'think_user AS a', tablePrefix: 'think_', model: 'user', where: { id: '1000' } })
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseOptions, field reverse', function(done){
    instance.alias('a').field('title', true).parseOptions(1000).then(function(options){
      assert.deepEqual(options, { alias: 'a',  field: [ 'wid', 'cate_id', 'cate_no' ],  fieldReverse: false,  table: 'think_user AS a',  tablePrefix: 'think_',  model: 'user',  where: { id: '1000' } })
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseOptions, key is not valid', function(done){
    instance.alias('a').where({
      'fasdf$www': 'welefen'
    }).parseOptions(1000).catch(function(){
      done();
    })
  });
  it('alias can not in show columns', function(done){
    var instance = new Base('user222', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.alias('a').select().then(function(){
      done();
    }).catch(function(err) { done(err) })
  });
  it('parseWhereOptions', function(){
    var options = instance.parseWhereOptions('10,20');
    assert.deepEqual(options, { where: { id: { IN: '10,20' } } })
  });
  it('add data, empty', function(done){
    instance.add().catch(function(){
      assert.deepEqual(instance._data, {});
      done();
    })
  });
  it('add data, has default', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: 'haha'
      }
    };
    instance.add({
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`name`,`title`) VALUES ('haha','test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default null', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: null
      }
    };
    instance.add({
      title: 'test'
    }).then(function(){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`title`) VALUES ('test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default empty', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: ''
      }
    };
    instance.add({
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`title`) VALUES ('test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default undefined', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: undefined
      }
    };
    instance.add({
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`title`) VALUES ('test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default 0', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: 0
      }
    };
    instance.add({
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`name`,`title`) VALUES (0,'test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default null, value 0', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: null
      }
    };
    instance.add({
      name: 0,
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`name`,`title`) VALUES (0,'test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default empty, value 0', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: ''
      }
    };
    instance.add({
      name: 0,
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`name`,`title`) VALUES (0,'test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default 0, value 1', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: 0
      }
    };
    instance.add({
      name: 1,
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`name`,`title`) VALUES (1,'test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default function', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: function(){return 'haha'}
      }
    };
    instance.add({
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`name`,`title`) VALUES ('haha','test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has default function, this', function(done){
    var instance = new Base('user', think.extend({}, think.config('db'), {test: 111}));
    instance.tablePrefix = 'think_';
    instance.schema = {
      name: {
        default: function(){return this.title + '_name'}
      }
    };
    instance.add({
      title: 'test'
    }).then(function(insertId){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`name`,`title`) VALUES ('test_name','test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add data, has data', function(done){
    instance.add({
      name: 'welefen',
      title: 'test'
    }).then(function(insertId){
      assert.equal(insertId, 100);
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`title`) VALUES ('test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('replace data, has data', function(done){
    instance.add({
      name: 'welefen',
      title: 'test'
    }, true).then(function(insertId){
      assert.equal(insertId, 1000);
      var sql = instance.getLastSql();
      assert.equal(sql, "REPLACE INTO `think_user` (`title`) VALUES ('test')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('thenAdd, not exist', function(done){
    instance.where({id: 897}).thenAdd({
      name: 'welefen',
      title: 'test'
    }).then(function(data){
      assert.deepEqual(data, { id: 100, type: 'add' })
      done();
    }).catch(function(err) { done(err) })
  });
  it('thenAdd, exist', function(done){
    instance.where({id: 898}).thenAdd({
      name: 'welefen',
      title: 'test'
    }).then(function(data){
      assert.deepEqual(data, { id: 898, type: 'exist' })
      done();
    }).catch(function(err) { done(err) })
  });
  it('add many', function(done){
    instance.addMany([{
      name: 'name1',
      title: 'title1'
    }, {
      name: 'name2',
      title: 'title2'
    }]).then(function(data){
      assert.deepEqual(data, [ 565, 566 ]);
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user`(`title`) VALUES ('title1'),('title2')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add many, replace', function(done){
    instance.addMany([{
      name: 'name1',
      title: 'title1'
    }, {
      name: 'name2',
      title: 'title2'
    }], true).then(function(data){
      assert.deepEqual(data, [ 343, 344 ]);
      var sql = instance.getLastSql();
      assert.equal(sql, "REPLACE INTO `think_user`(`title`) VALUES ('title1'),('title2')");
      done();
    }).catch(function(err) { done(err) })
  });
  it('add many, not array', function(done){
    instance.addMany().catch(function(err){
      done();
    }).catch(function(err) { done(err) })
  });
  it('delete data', function(done){
    instance.where({id: 1}).delete().then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "DELETE FROM `think_user` WHERE ( `id` = 1 )");
      assert.equal(data, 3);
      done();
    }).catch(function(err) { done(err) })
  });
  it('update, empty', function(done){
    instance.where({id: 100}).update().catch(function(err){
      assert.deepEqual(instance._options, {});
      assert.deepEqual(instance._data, {});
      done();
    }).catch(function(err) { done(err) })
  });
  it('update', function(done){
    instance.where({id: 101}).update({
      name: 'name1',
      title: 'title1'
    }).then(function(rows){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_user` SET `title`='title1' WHERE ( `id` = 101 )")
      assert.equal(rows, 1);
      done();
    }).catch(function(err) { done(err) })
  });
  it('update, readonlyFields', function(done){
    instance.readonlyFields = ['cate_id'];
    instance.where({id: 401}).update({
      cate_id: '1111',
      title: 'title1'
    }).then(function(rows){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_user` SET `title`='title1' WHERE ( `id` = 401 )")
      instance.readonlyFields = [];
      done();
    }).catch(function(err) { done(err) })
  });
  it('update, missing where condition', function(done){
    instance.update({title: 'www'}).catch(function(err){
      assert.deepEqual(instance._options, {});
      assert.deepEqual(instance._data, {})
      done();
    }).catch(function(err) { done(err) })
  });
  it('update, where condition from data', function(done){
    var instance = new Base('cate', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.update({
      id: 102,
      name: 'name1',
      title: 'title1'
    }).then(function(rows){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_cate` SET `title`='title1' WHERE ( `id` = 102 )")
      assert.equal(rows, 0);
      done();
    }).catch(function(err) { done(err) })
  });
  it('update many, empty', function(done){
    instance.where({id: 104}).updateMany().catch(function(err){
      done();
    }).catch(function(err) { done(err) })
  });
  it('update many', function(done){
    var instance = new Base('cate', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.updateMany([{
      id: 105,
      name: 'name1',
      title: 'title1'
    }]).then(function(rows){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_cate` SET `title`='title1' WHERE ( `id` = 105 )")
      assert.equal(rows, 0);
      done();
    }).catch(function(err) { done(err) })
  });
  it('update many 2', function(done){
    var instance = new Base('cate', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.updateMany([{
      id: 100,
      name: 'name1',
      title: 'title1'
    },{
      id: 106,
      name: 'name2',
      title: 'title2'
    }]).then(function(rows){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_cate` SET `title`='title2' WHERE ( `id` = 106 )")
      assert.equal(rows, 4);
      done();
    }).catch(function(err) { done(err) })
  });
  it('increment', function(done){
    instance.where({1: 1}).increment('title', 10).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_user` SET `title`=`title`+10 WHERE ( 1 = 1 )");
      //assert.equal(data, 1)
      done();
    }).catch(function(err) { done(err) })
  });
  it('increment, default step', function(done){
    instance.where({1: 1}).increment('title', 1, true).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_user` SET `title`=`title`+1 WHERE ( 1 = 1 )");
      //assert.equal(data, 1)
      done();
    }).catch(function(err) { done(err) })
  });
  it('decrement', function(done){
    instance.where({1: 1}).decrement('title', 10).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_user` SET `title`=`title`-10 WHERE ( 1 = 1 )");
      //assert.equal(data, 1)
      done();
    }).catch(function(err) { done(err) })
  });
  it('decrement, default step', function(done){
    instance.where({1: 1}).decrement('title').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_user` SET `title`=`title`-1 WHERE ( 1 = 1 )");
      //assert.equal(data, 1)
      done();
    }).catch(function(err) { done(err) })
  });
  it('find', function(done){
    instance.where({id: 100}).find().then(function(data){
      assert.equal(instance.getLastSql(), "SELECT * FROM `think_user` WHERE ( `id` = 100 ) LIMIT 1");
      assert.deepEqual(data, { id: 7565, title: 'title1', cate_id: 1, cate_no: 0 })
      done();
    }).catch(function(err) { done(err) })
  });
  it('select', function(done){
    instance.where({id: 100}).limit(1).select().then(function(data){
      assert.equal(instance.getLastSql(), "SELECT * FROM `think_user` WHERE ( `id` = 100 ) LIMIT 1");
      assert.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }])
      done();
    }).catch(function(err) { done(err) })
  });
  it('select, order has keyword', function(done){
    instance.where({id: 100}).limit(1).order('count(id) DESC').select().then(function(data){
      //console.log(instance.getLastSql())
      assert.equal(instance.getLastSql(), "SELECT * FROM `think_user` WHERE ( `id` = 100 ) ORDER BY count(id) DESC LIMIT 1");
      //assert.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }])
      done();
    }).catch(function(err) { done(err) })
  });
  it('select, order has keyword 1', function(done){
    instance.where({id: 100}).limit(1).order('INSTR( topicTitle, "ha" ) > 0 DESC').select().then(function(data){
      //console.log(instance.getLastSql())
      assert.equal(instance.getLastSql(), 'SELECT * FROM `think_user` WHERE ( `id` = 100 ) ORDER BY INSTR( topicTitle, "ha" ) > 0 DESC LIMIT 1');
      //assert.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }])
      done();
    }).catch(function(err) { done(err) })
  });
  it('select, field has keyword', function(done){
    instance.field("id, instr('30,35,31,',id+',') as d").where({id: 100}).limit(1).order('count(id)').select().then(function(data){
      assert.equal(instance.getLastSql(), "SELECT id, instr('30,35,31,',id+',') as d FROM `think_user` WHERE ( `id` = 100 ) ORDER BY count(id) LIMIT 1");
      //assert.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }])
      done();
    }).catch(function(err) { done(err) })
  });
  it('select add', function(done){
    instance.selectAdd({
      table: 'think_tag',
      where: {name: 'test'}
    }).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`wid`,`title`,`cate_id`,`cate_no`) SELECT * FROM `think_tag` WHERE ( `name` = 'test' )")
      done();
    }).catch(function(err) { done(err) })
  });
  it('select add, instance', function(done){
    var instance1 = new Base('tag', think.config('db'));
    instance1.tablePrefix = 'think_';
    instance1.where({name: 'test'});
    instance.selectAdd(instance1).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "INSERT INTO `think_user` (`wid`,`title`,`cate_id`,`cate_no`) SELECT * FROM `think_tag` WHERE ( `name` = 'test' )")
      done();
    }).catch(function(err) { done(err) })
  });
  it('count select', function(done){
    instance.where({name: 'test'}).page(3).countSelect().then(function(data){
      assert.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"numsPerPage":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]})
      done();
    }).catch(function(err) { done(err) })
  });
  it('count select, no page', function(done){
    instance.where({name: 'test'}).countSelect().then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT * FROM `think_user` WHERE ( `name` = 'test' ) LIMIT 0,10")
      //console.log(sql)
      //assert.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"numsPerPage":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]})
      done();
    }).catch(function(err) { done(err) })
  });
  it('count select, pageFlag: true', function(done){
    instance.where({name: 'test'}).page(3).countSelect(true).then(function(data){
      assert.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"numsPerPage":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]})
      done();
    }).catch(function(err) { done(err) })
  });
  it('count select, with count', function(done){
    instance.where({name: 'test'}).page(3).countSelect(399).then(function(data){
      assert.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"numsPerPage":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]})
      done();
    }).catch(function(err) { done(err) })
  });
  it('count select, with count, beyond pages', function(done){
    instance.where({name: 'test'}).page(300).countSelect(true).then(function(data){
      assert.deepEqual(data, {"count":399,"totalPages":40,"currentPage":1,"numsPerPage":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]})
      done();
    }).catch(function(err) { done(err) })
  });
  it('count select, with count, beyond pages 2', function(done){
    instance.where({name: 'test'}).page(300).countSelect(false).then(function(data){
      assert.deepEqual(data, {"count":399,"totalPages":40,"currentPage":40,"numsPerPage":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]})
      done();
    }).catch(function(err) { done(err) })
  });
  it('count, with join', function(done){
    instance.alias('c').join({
      table: 'product.app',
      join: 'left',
      as : 'app',
      on : ['channel_id', 'app_id']
    }).field([
      'c.channel_id as id',
      'c.name as name',
      'c.identifier as identifier',
      'app.app_id as app_id',
      'app.app_name as app_name',
      'app.appnm as appnm'
    ].join(',')).page(1, 20).count('c.channel_id').then(function(){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT COUNT(c.channel_id) AS think_count FROM think_user AS c LEFT JOIN think_product.app AS `app` ON `c`.`channel_id` = `app`.`app_id` LIMIT 1")
      done();
    }).catch(function(err) { done(err) })
  });
   it('countSelect, with join 2', function(done){
    instance.alias('c').join({
      table: 'product.app',
      join: 'left',
      as : 'app',
      on : ['channel_id', 'app_id']
    }).field([
      'c.channel_id as id',
      'c.name as name',
      'c.identifier as identifier',
      'app.app_id as app_id',
      'app.app_name as app_name',
      'app.appnm as appnm'
    ].join(',')).page(1, 20).countSelect().then(function(){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT c.channel_id as id,c.name as name,c.identifier as identifier,app.app_id as app_id,app.app_name as app_name,app.appnm as appnm FROM think_user AS c LEFT JOIN think_product.app AS `app` ON `c`.`channel_id` = `app`.`app_id` LIMIT 0,20");
      done();
    }).catch(function(err) { done(err) })
  });
   it('count select, with group', function(done){
    instance.where({name: 'test'}).page(1).group('name').countSelect(false).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT * FROM `think_user` WHERE ( `name` = 'test' ) GROUP BY `name` LIMIT 0,10")
      done();
    }).catch(function(err) { done(err) })
  });
  it('get field', function(done){
    instance.where({name: 'welefen'}).getField('title').then(function(data){
      assert.deepEqual(data, [ 'title1', 'title2' ]);
      done();
    }).catch(function(err) { done(err) })
  });
  it('get field, with limit', function(done){
    instance.where({name: 'welefen'}).getField('title', 1).then(function(data){
      assert.deepEqual(data, [ 'title1' ]);
      done();
    }).catch(function(err) { done(err) })
  });
  it('get field, with true', function(done){
    instance.where({name: 'welefen'}).getField('title', true).then(function(data){
      assert.deepEqual(data, 'title1');
      done();
    }).catch(function(err) { done(err) })
  });
  it('get field, with mutil', function(done){
    instance.where({name: 'welefen'}).getField('title,cate_no', true).then(function(data){
      assert.deepEqual(data, { title: 'title1', cate_no: 1000 });
      done();
    }).catch(function(err) { done(err) })
  });
  it('get field, with mutil 1', function(done){
    instance.where({name: 'welefen'}).getField('title,cate_no', 3).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT `title`,`cate_no` FROM `think_user` WHERE ( `name` = 'welefen' ) LIMIT 3");
      assert.deepEqual(data, { title: [ 'title1', 'title2', 'title3' ], cate_no: [ 1000, 1001, 1002 ] });
      done();
    }).catch(function(err) { done(err) })
  });
  it('expain', function(done){
    instance.where({name: 'welefen'}).explain(true).getField('title,cate_no', 3).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "EXPLAIN SELECT `title`,`cate_no` FROM `think_user` WHERE ( `name` = 'welefen' ) LIMIT 3");
      done();
    }).catch(function(err) { done(err) })
  });
  it('count', function(done){
    instance.count().then(function(data){
      assert.equal(data, 40000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('sum', function(done){
    instance.sum().then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT SUM(id) AS think_sum FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('sum, with field', function(done){
    instance.sum('id').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT SUM(`id`) AS think_sum FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('sum, with field key', function(done){
    instance.sum('key').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT SUM(`key`) AS think_sum FROM `think_user` LIMIT 1");
      done();
    }).catch(function(err) { done(err) })
  });
  it('min', function(done){
    instance.min().then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT MIN(id) AS think_min FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('min, with field', function(done){
    instance.min('id').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT MIN(`id`) AS think_min FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('min, with field key', function(done){
    instance.min('key').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT MIN(`key`) AS think_min FROM `think_user` LIMIT 1");
      done();
    }).catch(function(err) { done(err) })
  });
  it('max', function(done){
    instance.max().then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT MAX(id) AS think_max FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('max, with field', function(done){
    instance.max('id').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT MAX(`id`) AS think_max FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('max, with field key', function(done){
    instance.max('key').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT MAX(`key`) AS think_max FROM `think_user` LIMIT 1");
      done();
    }).catch(function(err) { done(err) })
  });
  it('avg', function(done){
    instance.avg().then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT AVG(id) AS think_avg FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('avg, with field', function(done){
    instance.avg('id').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT AVG(`id`) AS think_avg FROM `think_user` LIMIT 1");
      assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('avg, with field key', function(done){
    instance.avg('key').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT AVG(`key`) AS think_avg FROM `think_user` LIMIT 1");
      done();
    })
  });
  it('query', function(done){
    instance.query('SELECT * FROM __TABLE__ ').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT * FROM `think_user` ")
      done();
    }).catch(function(err) { done(err) })
  });
  it('query, tag', function(done){
    instance.query('SELECT * FROM __TAG__ ').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT * FROM `think_tag` ")
      done();
    }).catch(function(err) { done(err) })
  });
  it('execute, tag', function(done){
    instance.execute('UPDATE __TAG__ set name=1 where name=2').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "UPDATE `think_tag` set name=1 where name=2")
      done();
    }).catch(function(err) { done(err) })
  });
  it('startTrans', function(done){
    instance.startTrans().then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, 'START TRANSACTION');
      done();
    }).catch(function(err) { done(err) })
  });
  it('commit', function(done){
    instance.startTrans().then(function(){
      return instance.commit();
    }).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, '');
      done();
    }).catch(function(err) { done(err) })
  });
  it('rollback', function(done){
    instance.startTrans().then(function(){
      return instance.rollback();
    }).then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, '');
      done();
    }).catch(function(err) { done(err) })
  });
  it('transaction, commit', function(done){
    instance.transaction(function(){
      return instance.add({
        name: 'welefen',
        title: 'wwww'
      })
    }).then(function(){
      var sql = instance.getLastSql();
      assert.equal(sql, '');
      done();
    }).catch(function(err) { done(err) })
  });
  it('transaction, rollback', function(done){
    instance.transaction(function(){
      return Promise.reject(new Error('error'))
    }).then(function(){
      var sql = instance.getLastSql();
      assert.equal(sql, '');
      done();
    }).catch(function(err) { done(err) })
  });
  it('distinct with count', function(done){
    instance.count('distinct name').then(function(data){
      var sql = instance.getLastSql();
      assert.equal(sql, "SELECT COUNT(distinct name) AS think_count FROM `think_user` LIMIT 1");
      //assert.equal(data, 1000);
      done();
    }).catch(function(err) { done(err) })
  });
  it('after', function(){
    muk.restore();
  })
});