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

var clearRequireCache = function(){
  for(var name in require.cache){
    delete require.cache[name];
  }
}

describe('before', function(){
  it('before', function(){
    muk(MysqlSocket.prototype, 'query', function(sql){
      if (sql === 'SHOW COLUMNS FROM `think_friend`') {
        var data = [
          {"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return getPromise(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_cate`') {
        var data = [
          {"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return getPromise(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_tag`') {
        var data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return getPromise(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_user`') {
        var data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return getPromise(data);
      }else if (sql === 'SHOW COLUMNS FROM `think_type`') {
        var data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
          {"Field":"flo","Type":"float(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"is_show","Type":"bool","Null":"NO","Key":"MUL","Default":"1","Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return getPromise(data);
      }else if(sql.indexOf('SHOW COLUMNS ') > -1){
        var data = [
          {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":""},
          {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
          {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":"1","Extra":""},
          {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
        ];
        return getPromise(data);
      }else if (sql.indexOf("SELECT * FROM `think_type` WHERE ( `flo` = 0 ) LIMIT 1") > -1) {
        return getPromise([]);
      }else if (sql.indexOf('SELECT COUNT(think_tag.wid) AS thinkjs_count FROM `think_tag` LIMIT 1') > -1) {
        return getPromise([{
          thinkjs_count: 100
        }])
      }else if (sql.indexOf("SELECT `wid` FROM `think_group` LIMIT 2")> -1) {
        return getPromise([
          {"id":7565,"title":"米兰达·可儿干练服装写真大片","cate_id":1,"cate_no":0},
          {"id":7564,"title":"[Beautyleg]2014.05.21 No.977 Cindy","cate_id":2,"cate_no":977}
        ])
      };
      var data = [
        {"id":7565,"title":"米兰达·可儿干练服装写真大片","cate_id":1,"cate_no":0},
        {"id":7564,"title":"[Beautyleg]2014.05.21 No.977 Cindy","cate_id":2,"cate_no":977},
        {"id":7563,"title":"[DISI第四印象]2014.05.21 NO.281","cate_id":7,"cate_no":281},
        {"id":7562,"title":"[PANS写真]2014-05-20 NO.242 小倩 套图","cate_id":6,"cate_no":242},
        {"id":7561,"title":"[ROSI写真]2014.05.20 NO.896","cate_id":3,"cate_no":896},
        {"id":7560,"title":"[ROSI写真]2014.05.21 NO.897","cate_id":3,"cate_no":897},
        {"id":7559,"title":"[ROSI写真]2014.05.22 NO.898","cate_id":3,"cate_no":898},
        {"id":7558,"title":"[ru1mm写真] 2014-05-20 NO.151","cate_id":17,"cate_no":151},
        {"id":7557,"title":"[ru1mm写真] 2014-05-22 NO.152","cate_id":17,"cate_no":152}
      ]
      return getPromise(data);
    })
  })
});
describe('Model', function(){
  C('db_prefix', 'think_');
  var model = D('Group');

  describe('init', function(){
    it('undefined name', function(){
      var model = D();
      assert.equal(model.name, "");
    })
    it('config is string', function(){
      var model = D('Group', 'test_');
      assert.equal(model.tablePrefix, 'test_');
    })
    it('prototype tablePrefix is set', function(){
      thinkRequire('Model').__prop.tablePrefix = 'think_';
      var model = D('Group');
      assert.equal(model.tablePrefix, 'think_');
    })
  })

  describe('initDb', function(){
    var model = D('Group');
    it('configKey', function(){
      var db = model.initDb();
      assert.equal(db !== null, true);
      assert.equal(model.configKey, '9d4568c009d203ab10e33ea9953a0264');
    })
  })

  describe('getModelName', function(){
    it('this.name', function(){
      assert.equal(model.getModelName(), 'Group');
    })
    it('this.__filename', function(){
      var model = D();
      assert.equal(model.getModelName(), '')
    })
    it('__filename', function(){
      var model = D();
      model.__filename = '';
      model.name  = '';
      assert.equal(model.getModelName(), '')
    })
  })

  describe('getTableName', function(){
    it('getTableName', function(){
      assert.equal(model.getTableName(), 'think_group');
      assert.equal(model.getTableName(), 'think_group');
    })
    it('getTableName 1', function(){
      var model = D('Group');
      model.tablePrefix = '';
      assert.equal(model.getTableName(), 'group')
    })
    it('getTableName 1', function(){
      var model = D('UserGroup');
      model.tablePrefix = '';
      assert.equal(model.getTableName(), 'user_group')
    })
  })

  describe('getTableFields', function(){
    it('getTableFields', function(done){
      model.getTableFields().then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, [ 'wid', 'title', 'cate_id', 'cate_no' ]);
        done();
      })
    })
    it('getTableFields cache', function(done){
      model.fields = {};
      model.getTableFields().then(function(fields){
        assert.deepEqual(fields, [ 'wid', 'title', 'cate_id', 'cate_no' ]);
        done();
      })
    })
    it('getTableFields cache 1', function(done){
      model.fields = {};
      model.getTableFields().then(function(fields){
        return model.getTableFields()
      }).then(function(fields){
        assert.deepEqual(fields, [ 'wid', 'title', 'cate_id', 'cate_no' ]);
        done();
      })
    })
    it('getTableFields 1', function(done){
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, {"_field":["wid","title","cate_id","cate_no"],"_autoinc":false,"_unique":["title"],"_pk":"wid","_type":{"wid":"int(11) unsigned","title":"varchar(255)","cate_id":"tinyint(255)","cate_no":"int(11)"}});
        done();
      })
    })
    it('getTableFields 2', function(done){
      model.fields = {};
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, {"_field":["wid","title","cate_id","cate_no"],"_autoinc":false,"_unique":["title"],"_pk":"wid","_type":{"wid":"int(11) unsigned","title":"varchar(255)","cate_id":"tinyint(255)","cate_no":"int(11)"}});
        done();
      })
    })
    it('getTableFields 3', function(done){
      var model = D('Group');
      thinkRequire('Model').clearTableFieldsCache();
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, {"_field":["wid","title","cate_id","cate_no"],"_autoinc":false,"_unique":["title"],"_pk":"wid","_type":{"wid":"int(11) unsigned","title":"varchar(255)","cate_id":"tinyint(255)","cate_no":"int(11)"}});
        done();
      })
    })
    it('getTableFields 4', function(done){
      var model = D('Group');
      thinkRequire('Model').clearTableFieldsCache();
      C('db_fields_cache', false)
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, {"_field":["wid","title","cate_id","cate_no"],"_autoinc":false,"_unique":["title"],"_pk":"wid","_type":{"wid":"int(11) unsigned","title":"varchar(255)","cate_id":"tinyint(255)","cate_no":"int(11)"}});
        done();
      })
    })

  })

  describe('flushFields', function(){
    it('flushFields', function(done){
      model.flushFields().then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, {"_field":["wid","title","cate_id","cate_no"],"_autoinc":false,"_unique":["title"],"_pk":"wid","_type":{"wid":"int(11) unsigned","title":"varchar(255)","cate_id":"tinyint(255)","cate_no":"int(11)"}});
        done();
      })
    })
    it('flushFields', function(done){
      D('Tag').flushFields().then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, {"_field":["wid","title","cate_id","cate_no"],"_autoinc":true,"_unique":["title"],"_pk":"wid","_type":{"wid":"int(11) unsigned","title":"varchar(255)","cate_id":"tinyint(255)","cate_no":"int(11)"}});
        done();
      })
    })
  })

  describe('getUniqueField', function(){
    it('getUniqueField', function(){
      var unique = model.getUniqueField();
      assert.equal(unique, 'title')
    })
    it('getUniqueField1', function(){
      var unique = model.getUniqueField({});
      assert.equal(unique, undefined)
    })
  })

  describe('getLastSql', function(){
    it('getLastSql', function(done){
      var sql = model.getLastSql();
      assert.equal(sql, 'SHOW COLUMNS FROM `think_tag`');
      done();
    })
  })


  describe('getPk', function(){
    it('getPk cate', function(done){
      D('Cate').getPk().then(function(pk){
        assert.equal(pk, 'id');
        done();
      })
    })
    it('getPk tag', function(done){
      D('Tag').getPk().then(function(pk){
        assert.equal(pk, 'wid');
        done();
      })
    })
    it('getPk tag 1', function(done){
      var model = D('Tag')
      model.getPk().then(function(){
        assert.equal(model.getPk(), 'wid');
        done();
      })
    })
    it('getPk user', function(done){
      var model = D('User')
      model.getPk().then(function(){
        assert.equal(model.getPk(), 'id');
        done();
      })
    })
  })

  describe('cache', function(){
    it('empty cache', function(){
      assert.equal(model, model.cache());
    })
    it('cache key is true', function(){
      var model = D('Tag');
      model.cache(true);
      assert.deepEqual(model._options.cache, { key: '', timeout: 3600, type: '', gcType: 'dbCache' });
    })
    it('cache with key', function(){
      var model = D('Tag');
      model.cache('welefen');
      assert.deepEqual(model._options.cache, { key: 'welefen', timeout: 3600, type: '', gcType: 'dbCache' });
    })
    it('cache with key, timeout', function(){
      var model = D('Tag');
      model.cache('welefen', 100);
      assert.deepEqual(model._options.cache, { key: 'welefen', timeout: 100, type: '', gcType: 'dbCache' });
    })
    it('cache with number key', function(){
      var model = D('Tag');
      model.cache(100);
      assert.deepEqual(model._options.cache, { key: '', timeout: 100, type: '', gcType: 'dbCache' });
    })
    it('cache with object key', function(){
      var model = D('Tag');
      model.cache({key: 'welefen', timeout: 100});
      assert.deepEqual(model._options.cache, { key: 'welefen', timeout: 100});
    })
    it('cache return', function(){
      var model = D('Tag');
      model.cache({key: 'welefen', timeout: 100});
      assert.deepEqual(model, model.cache({key: 'welefen', timeout: 100}));
    })
  })

  describe('_getCacheOptions', function(){
    it('_getCacheOptions', function(){
      var model = D('Tag');
      var cache = model._getCacheOptions('welefen', 100, 'File');
      assert.equal(cache.cache_path.length > 0, true);
      delete cache.cache_path;
      assert.deepEqual(cache, {key: 'welefen',timeout: 100,type: 'File',gcType: 'dbCache'})
    })
  })

  describe('limit', function(){
    it('limit empty arguments', function(){
      var model = D('Tag');
      model.limit();
      assert.equal(model._options.limit, undefined);
    })
    it('limit with limit', function(){
      var model = D('Tag');
      model.limit(10);
      assert.equal(model._options.limit, 10);
    })
    it('limit with limit,length', function(){
      var model = D('Tag');
      model.limit(10, 10);
      assert.equal(model._options.limit, '10,10');
    })
    it('limit return value', function(){
      var model = D('Tag');
      assert.equal(model, model.limit(10, 10));
    })
  })
  describe('page', function(){
    it('page empty arguments', function(){
      var model = D('Tag');
      model.page();
      assert.equal(model._options.page, undefined);
    })
    it('page with page', function(){
      var model = D('Tag');
      model.page(10);
      assert.equal(model._options.page, 10);
    })
    it('page with page,length', function(){
      var model = D('Tag');
      model.page(10, 10);
      assert.equal(model._options.page, '10,10');
    })
    it('page return value', function(){
      var model = D('Tag');
      assert.equal(model, model.page(10, 10));
    })
  })
  describe('where', function(){
    it('where with empty arguments', function(){
      var model = D('Tag');
      assert.equal(model, model.where())
    })
    it('where with string', function(){
      var model = D('Tag');
      model.where('welefen test')
      assert.deepEqual(model._options.where, {_string: 'welefen test'})
    })
    it('where with obj', function(){
      var model = D('Tag');
      model.where({name: 'welefen'})
      assert.deepEqual(model._options.where, {name: 'welefen'})
    })
    it('where return value', function(){
      var model = D('Tag');
      assert.deepEqual(model, model.where({name: 'welefen'}))
    })
  })
  describe('field', function(){
    it('empty field', function(){
      var model = D('Tag');
      model.field();
      assert.deepEqual(model._options.field, '*');
    })
    it('empty field', function(){
      var model = D('Tag');
      model.field('');
      assert.deepEqual(model._options.field, '*');
    })
    it('string field', function(){
      var model = D('Tag');
      model.field('welefen');
      assert.deepEqual(model._options.field, 'welefen');
    })
    it('arr field', function(){
      var model = D('Tag');
      model.field(['welefen', 'suredy']);
      assert.deepEqual(model._options.field, 'welefen,suredy');
    })
    it('arr field, reverse', function(){
      var model = D('Tag');
      model.field(['welefen', 'suredy'], true);
      assert.deepEqual(model._options.field, 'welefen,suredy');
      assert.deepEqual(model._options.fieldReverse, true);
    })
    it('field return value', function(){
      var model = D('Tag');
      assert.equal(model, model.field(['welefen', 'suredy'], true));
    })
  })

  describe('table', function(){
    it('empty table', function(){
      var model = D('Tag');
      assert.equal(model, model.table());
    })
    it('table', function(){
      var model = D('tag');
      model.table('welefen');
      assert.equal(model._options.table, 'think_welefen');
    })
    it('table with prefix', function(){
      C('db_prefix', 'think_')
      var model = D('tag');
      model.table('welefen', true);
      assert.equal(model._options.table, 'welefen');
    })
    it('table return value', function(){
      var model = D('Tag');
      assert.equal(model, model.table('welefen'))
    })
  })
  describe('union', function(){
    it('empty union', function(){
      var model = D('Tag');
      assert.equal(model, model.union())
    })
    it('union', function(){
      var model = D('Tag');
      model.union('welefen');
      assert.deepEqual(model._options.union, [{union: 'welefen', all: undefined}])
    })
    it('union all', function(){
      var model = D('Tag');
      model.union('welefen', true);
      assert.deepEqual(model._options.union, [{union: 'welefen', all: true}])
    })
    it('union return ', function(){
      var model = D('Tag');
      assert.deepEqual(model, model.union('welefen'))
      model.union('suredy');
      assert.deepEqual(model._options.union, [{union: 'welefen', all: undefined}, {union: 'suredy', all: undefined}])
    })
  })
  describe('join', function(){
    it('empty join', function(){
      var model = D('Tag');
      assert.equal(model, model.join())
    })
    it('join', function(){
      var model = D('Tag');
      model.join('welefen');
      assert.deepEqual(model._options.join, ['welefen'])
    })
    it('join arr', function(){
      var model = D('Tag');
      model.join(['welefen', 'suredy']);
      assert.deepEqual(model._options.join, ['welefen', 'suredy'])
    })
    it('join return ', function(){
      var model = D('Tag');
      assert.deepEqual(model, model.join('welefen'))
      model.join('suredy');
      assert.deepEqual(model._options.join, ['welefen', 'suredy'])
    })
  })

  describe('buildSql', function(){
    it('buildSql', function(done){
      D('Tag').buildSql().then(function(sql){
        assert.equal(sql, '( SELECT * FROM `think_tag` )');
        done();
      })
    })
    it('buildSql 1', function(done){
      D('Group').buildSql().then(function(sql){
        assert.equal(sql, '( SELECT * FROM `think_group` )');
        done();
      })
    })
    it('buildSql with where', function(done){
      D('Group').where({title: 'welefen'}).buildSql().then(function(sql){
        assert.equal(sql, "( SELECT * FROM `think_group` WHERE ( `title` = 'welefen' ) )");
        done();
      })
    })
    it('buildSql with where 2', function(done){
      D('Group').where({title: "welefen'suredy"}).buildSql().then(function(sql){
        //console.log(sql)
        assert.equal(sql, "( SELECT * FROM `think_group` WHERE ( `title` = 'welefen\\'suredy' ) )");
        done();
      })
    })
  })

  describe('parseOptions', function(){
    it('empty options', function(done){
      D('Tag').parseOptions().then(function(options){
        assert.deepEqual(options, { table: 'think_tag', tablePrefix: 'think_', model: 'Tag' })
        done();
      })
    })
    it('table', function(done){
      D('Tag').table('welefen').parseOptions().then(function(options){
        //console.log(options)
        assert.deepEqual(options, { table: 'think_welefen', tablePrefix: 'think_', model: 'Tag' })
        done();
      })
    })
    it('table alias', function(done){
      D('Tag').alias('a').parseOptions().then(function(options){
        //console.log(options)
        assert.deepEqual(options,{"alias":"a","table":"think_tag AS a","tablePrefix":"think_","model":"Tag"})
        done();
      })
    })
    it('with where', function(done){
      D('Tag').where({title: 'welefen'}).parseOptions().then(function(options){
        //console.log(options)
        assert.deepEqual(options, {"where":{"title":"welefen"},"table":"think_tag","tablePrefix":"think_","model":"Tag"})
        done();
      })
    })
    it('with where', function(done){
      D('Tag').where({title: 'welefen'}).parseOptions().then(function(options){
        //console.log(options)
        assert.deepEqual(options, {"where":{"title":"welefen"},"table":"think_tag","tablePrefix":"think_","model":"Tag"})
        done();
      })
    })
    it('with where', function(done){
      D('Tag').where({title: ['welefen']}).parseOptions().then(function(options){
        //console.log(options)
        assert.deepEqual(options, {"where":{"title":["welefen"]},"table":"think_tag","tablePrefix":"think_","model":"Tag"})
        done();
      })
    })
    it('with where, invalid field', function(done){
      D('Tag').where({xxxx: 'welefen'}).parseOptions().catch(function(err){
        assert.equal(err.message, 'field `xxxx` in where condition is not valid')
        done();
      })
    })
    it('with where, user defined', function(done){
      D('Tag').where({_string: 'welefen'}).parseOptions().then(function(options){
        assert.deepEqual(options, {"where":{"_string":"welefen"},"table":"think_tag","tablePrefix":"think_","model":"Tag"})
        done();
      })
    })
    it('with field reverse', function(done){
      var model = D('Tag');
      model.field('title', true).parseOptions().then(function(options){
        assert.deepEqual(options, {"field":"wid,cate_id,cate_no","fieldReverse":false,"table":"think_tag","tablePrefix":"think_","model":"Tag"});
        assert.deepEqual(model._options, {})
        done();
      })
    })
    it('with scalar options', function(done){
      var model = D('Tag');
      model.field('title', true).parseOptions(100).then(function(options){
        //console.log(options)
        assert.deepEqual(options, {"field":"wid,cate_id,cate_no","fieldReverse":false,"table":"think_tag","tablePrefix":"think_","model":"Tag","where":{"wid":100}});
        assert.deepEqual(model._options, {})
        done();
      })
    })
  })
  describe('_optionsFilter', function(){
    it('_optionsFilter', function(){
      assert.deepEqual(D('Tag')._optionsFilter({}), {})
    })
  })

  describe('parseType', function(){
    it('parseType', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var data = model.parseType({id: 10}, 'id');
        assert.deepEqual(data, {id: 10})
        done();
      })
    })
    it('parseType int', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var data = model.parseType({wid: 10}, 'wid');
        assert.deepEqual(data, {wid: 10})
        done();
      })
    })
    it('parseType int', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var data = model.parseType({wid: 'ww'}, 'wid');
        assert.deepEqual(data, {wid: 0})
        done();
      })
    })
    it('parseType float', function(done){
      var model = D('Type');
      model.getTableFields().then(function(){
        var data = model.parseType({flo: 1.12}, 'flo');
        assert.deepEqual(data, {flo: 1.12})
        done();
      })
    })
    it('parseType float', function(done){
      var model = D('Type');
      model.getTableFields().then(function(){
        var data = model.parseType({flo: 'www'}, 'flo');
        assert.deepEqual(data, {flo: 0.0})
        done();
      })
    })
    it('parseType bool', function(done){
      var model = D('Type');
      model.getTableFields().then(function(){
        var data = model.parseType({is_show: 'www'}, 'is_show');
        //console.log(data)
        assert.deepEqual(data, {is_show: true})
        done();
      })
    })
  })
  describe('parseData', function(){
    it('parseData empty data', function(done){
      var model = D('Tag');
      model.parseOptions().then(function(){
        return model.parseData()
      }).then(function(data){
        assert.deepEqual(data, {});
        done();
      })
    })
    it('parseData data', function(done){
      var model = D('Tag');
      model.parseOptions().then(function(){
        return model.parseData({title: 'xxx'})
      }).then(function(data){
        assert.deepEqual(data, {title: 'xxx'});
        done();
      })
    })
    it('parseData data', function(done){
      var model = D('Tag');
      model.parseOptions().then(function(){
        return model.parseData({title: ['xxx']})
      }).then(function(data){
        assert.deepEqual(data, {title: ['xxx']});
        done();
      })
    })
    it('parseData data', function(done){
      var model = D('Tag');
      model.parseOptions().then(function(){
        return model.parseData({title1: 'xxx'})
      }).then(function(data){
        assert.deepEqual(data, {});
        done();
      })
    })
    it('parseData, fields empty', function(done){
      var data = D('Tag').parseData({title1: 'xxx'});
      assert.deepEqual(data, {title1: 'xxx'});
      done();
    })
    it('parseData with filer', function(done){
      var model = D('Tag');
      model._options.filter = function(key, value){
        return value
      }
      var data = model.parseData({title1: 'xxx'});
      assert.deepEqual(data, {title1: 'xxx'})
      done();
    })
    it('parseData with filer', function(done){
      var model = D('Tag');
      model._options.filter = function(key, value){
        if (key !== 'title1') {
          return value;
        }
      }
      var data = model.parseData({title1: 'xxx'});
      assert.deepEqual(data, {})
      done();
    })
    it('parseData with filer', function(done){
      var model = D('Tag');
      model._options.filter = function(key, value){
        if (key !== 'title1') {
          return key + ':' + value;
        }
      }
      var data = model.parseData({title1: 'xxx', title: 'xxx'});
      assert.deepEqual(data, {'title': 'title:xxx'})
      done();
    })
  })
  describe('_dataFilter', function(){
    it('_dataFilter', function(){
      assert.deepEqual(D('Tag')._dataFilter({}), {})
    })
  })
  describe('_beforeAdd', function(){
    it('_beforeAdd', function(){
      assert.deepEqual(D('Tag')._beforeAdd({}), {})
    })
  })
  describe('_afterAdd', function(){
    it('_afterAdd', function(){
      assert.deepEqual(D('Tag')._afterAdd({}), {})
    })
  })
  describe('add', function(){
    it('empty data', function(done){
      D('Tag').add().catch(function(err){
        assert.equal(err.message, '_DATA_TYPE_INVALID_')
        done();
      })
    })
    it('add data', function(done){
      var model = D('Tag');
      model.add({title: 'xxx'}).then(function(data){
        assert.equal(model.getLastSql(), "INSERT INTO `think_tag` (`title`) VALUES('xxx')")
        done();
      })
    })
    it('replace data', function(done){
      var model = D('Tag');
      model.where({wid: 1}).add({title: 'xxx'}, true).then(function(data){
        assert.equal(model.getLastSql(), "REPLACE INTO `think_tag` (`title`) VALUES('xxx')")
        done();
      })
    })
  })
  describe('thenAdd', function(){
    it('thenAdd', function(done){
      var model = D('Tag');
      model.thenAdd({title: 'xxxx'}, {title: 'xxxx'}).then(function(data){
        assert.equal(model.getLastSql().trim(), "SELECT * FROM `think_tag` WHERE ( `title` = 'xxxx' ) LIMIT 1")
        done();
      })
    })
    it('thenAdd true', function(done){
      var model = D('Tag');
      model.thenAdd({title: 'xxxx'}, {title: 'xxxx'}, true).then(function(data){
        assert.equal(model.getLastSql().trim(), "SELECT * FROM `think_tag` WHERE ( `title` = 'xxxx' ) LIMIT 1");
        assert.deepEqual(data, { id: undefined, type: 'exist' })
        done();
      })
    })
    it('thenAdd true', function(done){
      var model = D('Tag');
      model.where({title: 'xxxx'}).thenAdd({title: 'xxxx'}, true).then(function(data){
        assert.equal(model.getLastSql().trim(), "SELECT * FROM `think_tag` WHERE ( `title` = 'xxxx' ) LIMIT 1");
        assert.deepEqual(data, { id: undefined, type: 'exist' })
        done();
      })
    })
    it('thenAdd, where not exist', function(done){
      var model = D('Type');
      model.where({flo: 'xxxx'}).thenAdd({flo: 'xxxx'}, true).then(function(data){
        //console.log(model.getLastSql())
        assert.equal(model.getLastSql().trim(), "INSERT INTO `think_type` (`flo`) VALUES(0)");
        assert.deepEqual(data, { id: 0, type: 'add' })
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
    it('thenAdd, where not exist', function(done){
      var model = D('Type');
      model.where({flo: 'xxxx'}).thenAdd({flo: 'xxxx'}).then(function(data){
        //console.log(model.getLastSql())
        assert.equal(model.getLastSql().trim(), "INSERT INTO `think_type` (`flo`) VALUES(0)");
        assert.deepEqual(data, 0)
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  describe('addAll', function(){
    it('empty data', function(done){
      D('Tag').addAll().catch(function(err){
        assert.equal(err.message, '_DATA_TYPE_INVALID_')
        done();
      })
    })
    it('empty data', function(done){
      D('Tag').addAll([]).catch(function(err){
        assert.equal(err.message, '_DATA_TYPE_INVALID_')
        done();
      })
    })
    it('add single data', function(done){
      var model = D('Tag');
      model.addAll([{title: 'xxx'}]).then(function(data){
        assert.equal(model.getLastSql().trim(), "INSERT INTO `think_tag`(`title`) VALUES ('xxx')")
        done();
      })
    })
    it('add multi data', function(done){
      var model = D('Tag');
      model.addAll([{title: 'xxx'}, {title: 'yyy'}]).then(function(data){
        //console.log(model.getLastSql())
        assert.equal(model.getLastSql().trim(), "INSERT INTO `think_tag`(`title`) VALUES ('xxx'),('yyy')")
        done();
      })
    })
    it('add multi data with replace', function(done){
      var model = D('Tag');
      model.addAll([{title: 'xxx'}, {title: 'yyy'}], true).then(function(data){
        //console.log(model.getLastSql())
        assert.equal(model.getLastSql().trim(), "REPLACE INTO `think_tag`(`title`) VALUES ('xxx'),('yyy')")
        done();
      })
    })
  })
  describe('_afterDelete', function(){
    it('_afterDelete', function(){
      assert.deepEqual(D('Tag')._afterDelete({}), {})
    })
  })
  describe('delete', function(){
    it('delete', function(done){
      var model = D('Tag');
      model.delete().then(function(data){
        assert.equal(model.getLastSql().trim(), "DELETE FROM `think_tag`")
        done();
      })
    })
    it('delete with where', function(done){
      var model = D('Tag');
      model.where({wid: ['>', 10]}).delete().then(function(data){
        //console.log(model.getLastSql())
        assert.equal(model.getLastSql().trim(), "DELETE FROM `think_tag` WHERE ( `wid` > 10 )")
        done();
      })
    })
  })
  describe('_beforeUpdate', function(){
    it('_beforeUpdate', function(){
      assert.deepEqual(D('Tag')._beforeUpdate({}), {})
    })
  })
  describe('_afterUpdate', function(){
    it('_afterUpdate', function(){
      assert.deepEqual(D('Tag')._afterUpdate({}), {})
    })
  })
  describe('update', function(){
    it('empty data', function(done){
      var model = D('Tag');
      model.update().catch(function(err){
        assert.equal(err.message, '_DATA_TYPE_INVALID_')
        done(); 
      })
    })
    it('update data, no where condition', function(done){
      var model = D('Group');
      model.update({title: 'xxxx'}).catch(function(err){
        assert.equal(err.message, '_OPERATION_WRONG_');
        done();
      })
    })
    it('data', function(done){
      var model = D('Tag');
      model.update({wid: 10, title: 'www'}).then(function(data){
        //console.log(model.getLastSql())
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`='www' WHERE ( `wid` = 10 )");
        done(); 
      })
    })
    it('data', function(done){
      var model = D('Tag');
      model.where({wid: 10}).update({title: 'www'}).then(function(data){
        //console.log(model.getLastSql())
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`='www' WHERE ( `wid` = 10 )");
        done(); 
      })
    })
  })
  describe('updateAll', function(){
    it('empty data', function(done){
      var model = D('Tag');
      model.updateAll().catch(function(err){
        assert.equal(err.message, '_DATA_TYPE_INVALID_');
        done();
      }) 
    })
    it('empty data', function(done){
      var model = D('Tag');
      model.updateAll([]).catch(function(err){
        assert.equal(err.message, '_DATA_TYPE_INVALID_');
        done();
      }) 
    })
    it('update all', function(done){
      var model = D('Tag');
      model.updateAll([{wid: 10, title: 'xxx'}]).then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`='xxx' WHERE ( `wid` = 10 )")
        done();
      })
    })
  })
  describe('updateField', function(){
    it('update field', function(done){
      var model = D('Tag');
      model.where({wid: 10}).updateField('title', 'welefen').then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`='welefen' WHERE ( `wid` = 10 )")
        done();
      })
    })
    it('update field', function(done){
      var model = D('Tag');
      model.where({wid: 10}).updateField({title: 'welefen'}).then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`='welefen' WHERE ( `wid` = 10 )")
        done();
      })
    })
  })
  describe('updateInc', function(){
    it('updateInc', function(){
      var model = D('Tag');
      model.where({wid: 10}).updateInc('title').then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`=title+1 WHERE ( `wid` = 10 )")
        done();
      })
    })
    it('updateInc invalid step', function(){
      var model = D('Tag');
      model.where({wid: 10}).updateInc('title', 'fsadf').then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`=title+1 WHERE ( `wid` = 10 )")
        done();
      })
    })
    it('updateInc with step', function(){
      var model = D('Tag');
      model.where({wid: 10}).updateInc('title', 10).then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`=title+10 WHERE ( `wid` = 10 )")
        done();
      })
    })
  })
  describe('updateDec', function(){
    it('updateDec', function(){
      var model = D('Tag');
      model.where({wid: 10}).updateDec('title').then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`=title-1 WHERE ( `wid` = 10 )")
        done();
      })
    })
    it('updateDec invalid step', function(){
      var model = D('Tag');
      model.where({wid: 10}).updateDec('title', 'fsadf').then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`=title-1 WHERE ( `wid` = 10 )")
        done();
      })
    })
    it('updateDec with step', function(){
      var model = D('Tag');
      model.where({wid: 10}).updateDec('title', 10).then(function(data){
        assert.equal(model.getLastSql().trim(), "UPDATE `think_tag` SET `title`=title-10 WHERE ( `wid` = 10 )")
        done();
      })
    })
  })

  describe('parseWhereOptions', function(){
    it('parseWhereOptions number', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var options = model.parseWhereOptions(100);
        assert.deepEqual(options, { where: { wid: '100' } })
        done();
      })
    })
    it('parseWhereOptions string', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var options = model.parseWhereOptions('100');
        assert.deepEqual(options, { where: { wid: '100' } })
        done();
      })
    })
    it('parseWhereOptions string', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var options = model.parseWhereOptions('100, 200');
        assert.deepEqual(options,{ where: { wid: [ 'IN', '100, 200' ] } })
        done();
      })
    })
    it('empty options', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var options = model.parseWhereOptions();
        assert.deepEqual(options,{})
        done();
      })
    })
    it('options', function(done){
      var model = D('Tag');
      model.getTableFields().then(function(){
        var options = model.parseWhereOptions({});
        assert.deepEqual(options,{})
        done();
      })
    })
  })
  describe('_afterFind', function(){
    it('_afterFind', function(){
      assert.deepEqual(D('Tag')._afterFind({}), {})
    })
  })
  describe('find', function(){
    it('find', function(done){
      var model = D('Tag');
      model.find().then(function(){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 1")
        done();
      })
    })
  })
  describe('_afterSelect', function(){
    it('_afterSelect', function(){
      assert.deepEqual(D('Tag')._afterSelect({}), {})
    })
  })
  describe('select', function(){
    it('select', function(done){
      var model = D('Tag');
      model.select().then(function(){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag`")
        done()
      })
    })
  })
  describe('selectAdd', function(){
    it('selectAdd', function(done){
      var model = D('Tag');
      model.selectAdd(D('Group').field('id,title')).then(function(){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "INSERT INTO `think_tag` (`wid`,`title`,`cate_id`,`cate_no`) SELECT `id`,`title` FROM `think_group`")
        done();
      })
    })
    it('selectAdd', function(done){
      var model = D('Tag');
      var promise = D('Group').field('id,title').parseOptions();
      promise.then(function(options){
        model.selectAdd(options).then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, "INSERT INTO `think_tag` (`wid`,`title`,`cate_id`,`cate_no`) SELECT `id`,`title` FROM `think_group`")
          done();
        })
      })
    })
  })
  describe('countSelect', function(){
    it('countSelect', function(done){
      var model = D('Tag');
      model.page(1).countSelect().then(function(data){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 0,20");
        assert.equal(data.count, 100);
        assert.equal(data.total, 5);
        assert.equal(data.num, 20);
        assert.equal(data.page, 1);
        done();
      })
    })
    it('countSelect no page', function(done){
      var model = D('Tag');
      model.countSelect().then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 0,20");
        done();
      })
    })
    it('countSelect with page', function(done){
      var model = D('Tag');
      model.page(2, 30).countSelect().then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 30,30");
        done();
      })
    })
    it('countSelect with page', function(done){
      var model = D('Tag');
      model.page('ww', 30).countSelect().then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 0,30");
        done();
      })
    })
    it('countSelect', function(done){
      var model = D('Tag');
      model.page(1).countSelect().then(function(data){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 0,20");
        delete data.data;
        assert.deepEqual(data, { count: 100, total: 5, page: 1, num: 20 });
        done();
      })
    })
    it('countSelect', function(done){
      var model = D('Tag');
      model.page(200).countSelect().then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 3980,20");
        delete data.data;
        //console.log(data)
        assert.deepEqual(data, { count: 100, total: 5, page: 200, num: 20 });
        done();
      })
    })
    it('countSelect', function(done){
      var model = D('Tag');
      model.page(200).countSelect(true).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 0,20");
        delete data.data;
        //console.log(data)
        assert.deepEqual(data, { count: 100, total: 5, page: 1, num: 20 });
        done();
      })
    })
    it('countSelect', function(done){
      var model = D('Tag');
      model.page(200).countSelect(false).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 80,20");
        delete data.data;
        //console.log(data)
        assert.deepEqual(data, { count: 100, total: 5, page: 5, num: 20 });
        done();
      })
    })
    it('countSelect', function(done){
      var model = D('Tag');
      model.page(2).countSelect(false).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 20,20");
        delete data.data;
        //console.log(data)
        assert.deepEqual(data, { count: 100, total: 5, page: 2, num: 20 });
        done();
      })
    })
  })

  describe('getField', function(){
    it('getField', function(done){
      var model = D('Group');
      model.getField('wid').then(function(data){
        assert.deepEqual(data, [ 7565, 7564, 7563, 7562, 7561, 7560, 7559, 7558, 7557 ])
        done();
      })
    })
    it('getField one', function(done){
      var model = D('Group');
      model.getField('wid', true).then(function(data){
        assert.deepEqual(data, 7565)
        done();
      })
    })
    it('getField multi', function(done){
      var model = D('Group');
      model.getField('wid', 2).then(function(data){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT `wid` FROM `think_group` LIMIT 2")
        //console.log(data);
        assert.deepEqual(data, [7565, 7564])
        done();
      })
    })
    it('getField multi field', function(done){
      var model = D('Tag');
      model.getField('id,cate_id').then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT `id`,`cate_id` FROM `think_tag`")
        //console.log(data);
        assert.deepEqual(data, { id: [ 7565, 7564, 7563, 7562, 7561, 7560, 7559, 7558, 7557 ],cate_id: [ 1, 2, 7, 6, 3, 3, 3, 17, 17 ] })
        done();
      })
    })
    it('getField multi field', function(done){
      var model = D('Tag');
      model.getField('id,cate_id', true).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT `id`,`cate_id` FROM `think_tag` LIMIT 1")
        //console.log(data);
        assert.deepEqual(data, { id: 7565, cate_id: 1 })
        done();
      })
    })
  })
  describe('getBy', function(){
    it('getBy', function(done){
      var model = D('Tag');
      model.getBy('title', 'xxx').then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql);
        assert.equal(sql, "SELECT * FROM `think_tag` WHERE ( `title` = 'xxx' ) LIMIT 1")
        done();
      })
    })
  })
  describe('query', function(){
    it('query no pars', function(done){
      var model = D('Tag');
      model.query('SELECT * FROM __TABLE__').then(function(data){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT * FROM `think_tag`")
        done()
      })
    })
    it('query with pars', function(done){
      var model = D('Tag');
      model.query('SELECT * FROM __TABLE__ LIMIT %d,%d', 1, 2).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 1,2")
        done()
      })
    })
    it('query with pars array', function(done){
      var model = D('Tag');
      model.query('SELECT * FROM __TABLE__ LIMIT %d,%d', [1, 2]).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 1,2")
        done()
      })
    })
    it('query with __USER__', function(done){
      var model = D('Tag');
      model.query('SELECT * FROM __USER__').then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_user`")
        done()
      })
    })
  })
  describe('execute', function(){
    it('execute no pars', function(done){
      var model = D('Tag');
      model.execute('SELECT * FROM __TABLE__').then(function(data){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT * FROM `think_tag`")
        done()
      })
    })
    it('execute with pars', function(done){
      var model = D('Tag');
      model.execute('SELECT * FROM __TABLE__ LIMIT %d,%d', 1, 2).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 1,2")
        done()
      })
    })
    it('execute with pars array', function(done){
      var model = D('Tag');
      model.execute('SELECT * FROM __TABLE__ LIMIT %d,%d', [1, 2]).then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_tag` LIMIT 1,2")
        done()
      })
    })
    it('execute with __USER__', function(done){
      var model = D('Tag');
      model.execute('SELECT * FROM __USER__').then(function(data){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_user`")
        done()
      })
    })
  })  
  describe('parseSql', function(){
    it('parseSql', function(done){
      var model = D('Tag');
      var sql = model.parseSql('select * from %s', 'think_user');
      assert.equal(sql, "select * from think_user");
      done();
    })
  })
  describe('startTrans', function(){
    it('startTrans', function(done){
      var model = D('Tag');
      model.startTrans().then(function(){
        var sql = model.getLastSql().trim();
        // console.log(sql)
        assert.equal(sql, "START TRANSACTION");
        done();
      })
    })
  })
  describe('commit', function(){
    it('commit', function(done){
      var model = D('Tag');
      model.commit().then(function(){
        var sql = model.getLastSql().trim();
        // console.log(sql)
        assert.equal(sql, "COMMIT");
        done();
      })
    })
  })
  describe('rollback', function(){
    it('rollback', function(done){
      var model = D('Tag');
      model.startTrans().then(function(){
        return model.rollback();
      }).then(function(){
        var sql = model.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "ROLLBACK");
        done();
      })
    })
  })
  describe('data', function(){
    it('get data', function(){
      var model = D('Tag');
      assert.deepEqual(model.data(true), {})
    })
    it('querystring data', function(){
      var model = D('Tag');
      model.data('name=welefen')
      assert.deepEqual(model._data, {name: 'welefen'})
    })
    it('obj data', function(){
      var model = D('Tag');
      model.data({name: 'welefen'});
      assert.deepEqual(model._data, {name: 'welefen'})
    })
    it('obj data return', function(){
      var model = D('Tag');
      var ret = model.data({name: 'welefen'});
      assert.equal(ret, model)
    })
  })
  describe('options', function(){
    it('get options', function(){
      var model = D('Tag');
      var options = model.options(true);
      assert.deepEqual(options, {})
    })
  })
  describe('close', function(){
    it('close', function(){
      var model = D('Tag');
      model.close();
    })
    it('close db', function(){
      var model = D('Tag');
      model.initDb();
      model.close();
    })
  })
  describe('distinct', function(){
    it('distinct', function(){
      var model = D('Tag');
      model.distinct(true);
      assert.deepEqual(model._options.distinct, true)
    })
    it('distinct field', function(){
      var model = D('Tag');
      model.distinct('title');
      assert.deepEqual(model._options.distinct, 'title');
      assert.deepEqual(model._options.field, 'title')
    })
  })
  describe('method list', function(){
    it('method list', function(){
      var model = D('Tag');
      var method = [
        'order','alias','having','group',
        'lock','auto','filter','validate',
        'count','sum','min','max','avg',
        'save', 'setField', 'setInc', 'setDec'
      ]
      method.forEach(function(item){
        assert.equal(isFunction(model[item]), true)
      })
    })
  })
  describe('count', function(){
    it('count', function(done){
      var model = D('Tag');
      model.count().then(function(){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT COUNT(id) AS thinkjs_count FROM `think_tag` LIMIT 1")
        done();
      })
    })
    it('count field', function(done){
      var model = D('Tag');
      model.count('wid').then(function(){
        var sql = model.getLastSql().trim();
        assert.equal(sql, "SELECT COUNT(wid) AS thinkjs_count FROM `think_tag` LIMIT 1")
        done();
      })
    })
  })
  describe('setInc', function(){
    it('setDec', function(done){
      var model = D('Tag');
      model.where({wid: 100}).setDec('title').then(function(){
        var sql = model.getLastSql().trim();
        //console.log(sql);
        assert.equal(sql, "UPDATE `think_tag` SET `title`=title-1 WHERE ( `wid` = 100 )")
        done()
      })
    })
  })
  describe('Mode.close', function(){
    it('Model.close', function(){
      thinkRequire('Model').close();
      assert.equal(isFunction(thinkRequire('Model').close), true)
    })
  })


});
describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})