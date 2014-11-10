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

describe('Model_Db', function(){
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
  })

  describe('getTableFields', function(){
    it('getTableFields', function(done){
      model.getTableFields().then(function(fields){
        assert.deepEqual(fields, [ 'id', 'title', 'cate_id', 'cate_no', 'md5', 'width', 'height', 'pic_nums', 'view_nums', 'content', 'date', 'is_hide', 'is_safe' ]);
        done();
      })
    })
    it('getTableFields cache', function(done){
      model.fields = {};
      model.getTableFields().then(function(fields){
        assert.deepEqual(fields, [ 'id', 'title', 'cate_id', 'cate_no', 'md5', 'width', 'height', 'pic_nums', 'view_nums', 'content', 'date', 'is_hide', 'is_safe' ]);
        done();
      })
    })
    it('getTableFields 1', function(done){
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, { _field:    [ 'id',     'title',     'cate_id',     'cate_no',     'md5',     'width',     'height',     'pic_nums',     'view_nums',     'content',     'date',     'is_hide',     'is_safe' ],  _autoinc: true,  _unique: [ 'title' ],  _pk: 'id',  _type:    { id: 'int(11) unsigned',     title: 'varchar(255)',     cate_id: 'tinyint(255)',     cate_no: 'int(11)',     md5: 'varchar(255)',     width: 'int(11)',     height: 'int(11)',     pic_nums: 'int(11)',     view_nums: 'int(11)',     content: 'text',     date: 'int(11)',     is_hide: 'tinyint(11)',     is_safe: 'tinyint(11)' } });
        done();
      })
    })
    it('getTableFields 2', function(done){
      model.fields = {};
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, { _field:    [ 'id',     'title',     'cate_id',     'cate_no',     'md5',     'width',     'height',     'pic_nums',     'view_nums',     'content',     'date',     'is_hide',     'is_safe' ],  _autoinc: true,  _unique: [ 'title' ],  _pk: 'id',  _type:    { id: 'int(11) unsigned',     title: 'varchar(255)',     cate_id: 'tinyint(255)',     cate_no: 'int(11)',     md5: 'varchar(255)',     width: 'int(11)',     height: 'int(11)',     pic_nums: 'int(11)',     view_nums: 'int(11)',     content: 'text',     date: 'int(11)',     is_hide: 'tinyint(11)',     is_safe: 'tinyint(11)' } });
        done();
      })
    })
    it('getTableFields 3', function(done){
      var model = D('Group');
      thinkRequire('Model').clearTableFieldsCache();
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, { _field: [ 'id',     'title',     'cate_id',     'cate_no',     'md5',     'width',     'height',     'pic_nums',     'view_nums',     'content',     'date',     'is_hide',     'is_safe' ],  _autoinc: true,  _unique: [ 'title' ],  _pk: 'id',  _type:    { id: 'int(11) unsigned',     title: 'varchar(255)',     cate_id: 'tinyint(255)',     cate_no: 'int(11)',     md5: 'varchar(255)',     width: 'int(11)',     height: 'int(11)',     pic_nums: 'int(11)',     view_nums: 'int(11)',     content: 'text',     date: 'int(11)',     is_hide: 'tinyint(11)',     is_safe: 'tinyint(11)' } });
        done();
      })
    })
    it('getTableFields 4', function(done){
      var model = D('Group');
      thinkRequire('Model').clearTableFieldsCache();
      C('db_fields_cache', false)
      model.getTableFields(true).then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields, { _field:    [ 'id',     'title',     'cate_id',     'cate_no',     'md5',     'width',     'height',     'pic_nums',     'view_nums',     'content',     'date',     'is_hide',     'is_safe' ],  _autoinc: true,  _unique: [ 'title' ],  _pk: 'id',  _type:    { id: 'int(11) unsigned',     title: 'varchar(255)',     cate_id: 'tinyint(255)',     cate_no: 'int(11)',     md5: 'varchar(255)',     width: 'int(11)',     height: 'int(11)',     pic_nums: 'int(11)',     view_nums: 'int(11)',     content: 'text',     date: 'int(11)',     is_hide: 'tinyint(11)',     is_safe: 'tinyint(11)' } });
        done();
      })
    })

  })

  describe('flushFields', function(){
    it('flushFields', function(done){
      model.flushFields().then(function(fields){
        assert.deepEqual(fields, { _field:    [ 'id',     'title',     'cate_id',     'cate_no',     'md5',     'width',     'height',     'pic_nums',     'view_nums',     'content',     'date',     'is_hide',     'is_safe' ],  _autoinc: true,  _unique: [ 'title' ],  _pk: 'id',  _type:    { id: 'int(11) unsigned',     title: 'varchar(255)',     cate_id: 'tinyint(255)',     cate_no: 'int(11)',     md5: 'varchar(255)',     width: 'int(11)',     height: 'int(11)',     pic_nums: 'int(11)',     view_nums: 'int(11)',     content: 'text',     date: 'int(11)',     is_hide: 'tinyint(11)',     is_safe: 'tinyint(11)' } });
        done();
      })
    })
    it('flushFields no primary', function(done){
      D('Friend').flushFields().then(function(fields){
        //console.log(fields)
        assert.deepEqual(fields,{ _field:    [ 'id',     'title',     'cate_id',     'cate_no',     'md5',     'width',     'height',     'pic_nums',     'view_nums',     'content',     'date',     'is_hide',     'is_safe' ],  _autoinc: false,  _unique: [ 'title' ],  _type:    { id: 'int(11) unsigned',     title: 'varchar(255)',     cate_id: 'tinyint(255)',     cate_no: 'int(11)',     md5: 'varchar(255)',     width: 'int(11)',     height: 'int(11)',     pic_nums: 'int(11)',     view_nums: 'int(11)',     content: 'text',     date: 'int(11)',     is_hide: 'tinyint(11)',     is_safe: 'tinyint(11)' } });
        done();
      })
    })
  })

describe('getPk', function(){
  it('getPk cate', function(done){
    D('Cate').getPk().then(function(pk){
      assert.equal(pk, 'wid');
      done();
    })
  })
  it('getPk tag', function(done){
    D('Tag').getPk().then(function(pk){
      assert.equal(pk, 'id');
      done();
    })
  })
  it('getPk tag 1', function(done){
    var model = D('Tag')
    model.getPk().then(function(){
      assert.equal(model.getPk(), 'id');
      done();
    })
  })
})


  describe('select', function(){

    describe('common', function(){
      it('select all', function(done){
        model.select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group`')
          done();
        })
      })
      it('find one', function(done){
        model.find().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 1')
          done();
        })
      })
    })

    describe('field', function(){
      it('sql with empty field', function(done){
        model.field().select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group`');
          done();
        })
      })

      it('sql with string field', function(done){
        model.field('id, title').select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT `id`,`title` FROM `think_group`');
          done();
        })
      })

      it('sql with array field', function(done){
        model.field(['id', 'title']).select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT `id`,`title` FROM `think_group`');
          done();
        })
      })

      it('sql with reverse field', function(done){
        model.field(['id', 'title'], true).select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT `cate_id`,`cate_no`,`md5`,`width`,`height`,`pic_nums`,`view_nums`,`content`,`date`,`is_hide`,`is_safe` FROM `think_group`');
          done();
        })
      })
    })


    describe('limit', function(){
      it('sql with limit', function(done){
        model.limit(10).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 10');
          done();
        })
      })
      it('sql with limit, length', function(done){
        model.limit(10, 20).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 10,20');
          done();
        })
      })

      it('sql with error limit', function(done){
        model.limit('10xx').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 0');
          done();
        })
      })

      it('sql with error limit1', function(done){
        model.limit('10', '').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 10,0');
          done();
        })
      })
    })

  
    describe('page', function(){
      it('sql with empty page', function(done){
        model.page().select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group`')
          done();
        })
      })
      it('sql with page 0', function(done){
        model.page(0).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 0,20')
          done();
        })
      })
      it('sql with page 1', function(done){
        model.page(1).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 0,20')
          done();
        })
      })
      it('sql with page, listRows', function(done){
        model.page(1, 10).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 0,10')
          done();
        })
      })
      it('sql with page, listRows1', function(done){
        model.page(2, 10).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 10,10')
          done();
        })
      })
      it('sql with error page', function(done){
        model.page('www').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 0,20')
          done();
        })
      })
      it('sql with error page,listRows', function(done){
        model.page('www', 'www').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LIMIT 0,20')
          done();
        })
      })
    })


    describe('union', function(){
      var model = D('Pic1');
      it('union 1', function(done){
        model.union('select * from think_pic2').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_pic1` UNION (select * from think_pic2)')
          done();
        })
      })
      it('union all', function(done){
        model.union('select * from think_pic2', true).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_pic1` UNION ALL (select * from think_pic2)')
          done();
        })
      })
      it('union all2', function(done){
        model.union({
          table: 'think_pic2'
        }, true).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_pic1` UNION ALL (SELECT * FROM `think_pic2`)')
          done();
        })
      })
      it('union all3', function(done){
        model.union({
          table: 'think_pic2',
        }, true).union('select * from think_pic3').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_pic1` UNION ALL (SELECT * FROM `think_pic2`) UNION (select * from think_pic3)')
          done();
        })
      })
    })

    describe('join', function(){
      it('join', function(done){
        model.join('xxx').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN xxx')
          done();
        })
      })
      it('join on', function(done){
        model.join('think_xxx ON think_group.id = think_xxx.group_id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN think_xxx ON think_group.id = think_xxx.group_id')
          done();
        })
      })
      it('join on arr', function(done){
        model.join(['think_xxx ON think_group.id = think_xxx.group_id', 'think_xxx ON think_group.id = think_xxx.group_id']).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN think_xxx ON think_group.id = think_xxx.group_id LEFT JOIN think_xxx ON think_group.id = think_xxx.group_id')
          done();
        })
      })
      it('right join on', function(done){
        model.join('RIGHT JOIN think_xxx ON think_group.id = think_xxx.group_id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` RIGHT JOIN think_xxx ON think_group.id = think_xxx.group_id')
          done();
        })
      })
      it('inner join on', function(done){
        model.join('INNER JOIN think_xxx ON think_group.id = think_xxx.group_id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` INNER JOIN think_xxx ON think_group.id = think_xxx.group_id')
          done();
        })
      })
      it('join on', function(done){
        model.join({
          table: 'cate',
          as: 'c',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` AS c ON think_group.`id`=c.`id`')
          done();
        })
      })
      it('join with table on', function(done){
        model.alias('a').join({
          table: 'cate',
          as: 'c',
          on: ['a.id', 'c.id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a LEFT JOIN `think_cate` AS c ON a.id=c.id')
          done();
        })
      })
      it('join on multi condition', function(done){
        model.join({
          table: 'cate',
          as: 'c',
          on: {id: 'id', title: 'name'}
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` AS c ON (think_group.`id`=c.`id` AND think_group.`title`=c.`name`)')
          done();
        })
      })
      it('right join on1', function(done){
        model.alias('a').join({
          table: 'cate',
          join: 'right',
          as: 'c',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a RIGHT JOIN `think_cate` AS c ON a.`id`=c.`id`')
          done();
        })
      })
      it('inner join', function(done){
        model.alias('a').join({
          table: 'cate',
          join: 'inner',
          as: 'c',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a INNER JOIN `think_cate` AS c ON a.`id`=c.`id`')
          done();
        })
      })
      it('multi join', function(done){
        model.alias('a').join({
          table: 'cate',
          join: 'left',
          as: 'c',
          on: ['id', 'id']
        }).join({
          table: 'group_tag',
          join: 'left',
          as: 'd',
          on: ['id', 'group_id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a LEFT JOIN `think_cate` AS c ON a.`id`=c.`id` LEFT JOIN `think_group_tag` AS d ON a.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join1', function(done){
        model.alias('a').join({
          cate: {
            join: 'left',
            as: 'c',
            on: ['id', 'id']
          },
          group_tag: {
            join: 'left',
            as: 'd',
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a LEFT JOIN `think_cate` AS c ON a.`id`=c.`id` LEFT JOIN `think_group_tag` AS d ON a.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join1 with table on', function(done){
        model.alias('a').join({
          cate: {
            join: 'left',
            as: 'c',
            on: ['id', 'id']
          },
          group_tag: {
            join: 'left',
            as: 'd',
            on: ['c.id', 'd.group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a LEFT JOIN `think_cate` AS c ON a.`id`=c.`id` LEFT JOIN `think_group_tag` AS d ON c.id=d.group_id')
          done();
        })
      })
      it('multi join2', function(done){
        model.join({
          cate: {
            join: 'left',
            as: 'c',
            on: ['id', 'id']
          },
          group_tag: {
            join: 'left',
            as: 'd',
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` AS c ON think_group.`id`=c.`id` LEFT JOIN `think_group_tag` AS d ON think_group.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join2', function(done){
        model.join({
          cate: {
            as: 'c',
            on: ['id', 'id']
          },
          group_tag: {
            as: 'd',
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` AS c ON think_group.`id`=c.`id` LEFT JOIN `think_group_tag` AS d ON think_group.`id`=d.`group_id`')
          done();
        })
      })
      it('multi join3', function(done){
        model.join({
          cate: {
            on: ['id', 'id']
          },
          group_tag: {
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` ON think_group.`id`=think_cate.`id` LEFT JOIN `think_group_tag` ON think_group.`id`=think_group_tag.`group_id`')
          done();
        })
      })
      it('multi join4', function(done){
        model.join({
          cate: {
            on: 'id,id'
          },
          group_tag: {
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` ON think_group.`id`=think_cate.`id` LEFT JOIN `think_group_tag` ON think_group.`id`=think_group_tag.`group_id`')
          done();
        })
      })
      it('multi join5', function(done){
        model.join({
          cate: {
            on: 'id, id'
          },
          group_tag: {
            on: ['id', 'group_id']
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` ON think_group.`id`=think_cate.`id` LEFT JOIN `think_group_tag` ON think_group.`id`=think_group_tag.`group_id`')
          done();
        })
      })

      it('multi join6', function(done){
        model.join({
          cate: {
            on: 'id, id'
          },
          group_tag: {
            on: ['id', 'group_id']
          },
          tag: {
            on: {
              id: 'id',
              title: 'name'
            }
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` LEFT JOIN `think_cate` ON think_group.`id`=think_cate.`id` LEFT JOIN `think_group_tag` ON think_group.`id`=think_group_tag.`group_id` LEFT JOIN `think_tag` ON (think_group.`id`=think_tag.`id` AND think_group.`title`=think_tag.`name`)')
          done();
        })
      })
      // table 子查询表连接
      it('buildSql join', function(done){
        model.alias('a').join({
          table: 'select * from think_group',
          join: 'left',
          as: 'b',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a LEFT JOIN (select * from think_group) AS b ON a.`id`=b.`id`')
          done();
        })
      })
      it('buildSql join with bracet', function(done){
        model.alias('a').join({
          table: ' (select * from think_group) ',
          join: 'left',
          as: 'b',
          on: ['id', 'id']
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a LEFT JOIN (select * from think_group) AS b ON a.`id`=b.`id`')
          done();
        })
      })
    })

    describe('table', function(){
      it('table', function(done){
        model.table('xxx').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_xxx`')
          done();
        })
      })
      it('table', function(done){
        assert.equal(model.table(), model);
        done();
      })
      it('table arr', function(done){
        model.table('xxx', true).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `xxx`')
          done();
        })
      })
    })

    describe('order', function(){
      it('order by id', function(done){
        model.order('id').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY id')
          done();
        })
      })
      it('order by id ASC', function(done){
        model.order('id ASC').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY id ASC')
          done();
        })
      })
      it('order by id DESC', function(done){
        model.order('id DESC').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY id DESC')
          done();
        })
      })
      it('order by id DESC,title ASC', function(done){
        model.order('id DESC,title ASC').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY id DESC,title ASC')
          done();
        })
      })
      it('order by arr', function(done){
        model.order(['id ASC']).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY id ASC')
          done();
        })
      })
      it('order by arr', function(done){
        model.order(['id ASC', 'title DESC']).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY id ASC,title DESC')
          done();
        })
      })
      it('order by obj', function(done){
        model.order({id: 'ASC'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY `id` ASC')
          done();
        })
      })
      it('order by obj1', function(done){
        model.order({id: 'ASC', title: 'DESC'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` ORDER BY `id` ASC,`title` DESC')
          done();
        })
      })
    })

    describe('alias', function(){
      it('table alias', function(done){
        model.alias('a').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS a')
          done();
        })
      })
    })
    describe('having', function(){
      it('having', function(done){
        model.having('view_nums > 1000').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` HAVING view_nums > 1000')
          done();
        })
      })
      it('having and', function(done){
        model.having('view_nums > 1000 AND view_nums < 2000').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` HAVING view_nums > 1000 AND view_nums < 2000')
          done();
        })
      })
    })

    describe('group', function(){
      it('group by title', function(done){
        model.group('title').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` GROUP BY `title`')
          done();
        })
      })
      it('group by view_nums', function(done){
        model.group('view_nums').select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group` GROUP BY `view_nums`')
          done();
        })
      })
      it('group by view_nums has alias', function(done){
        model.group('c.view_nums').select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group` GROUP BY c.`view_nums`')
          done();
        })
      })
      it('group by multi', function(done){
        model.group('id,view_nums').select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group` GROUP BY `id`,`view_nums`')
          done();
        })
      })
      it('group by multi alias', function(done){
        model.group('c.id,c.view_nums').select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group` GROUP BY c.`id`,c.`view_nums`')
          done();
        })
      })
    })

    describe('lock', function(){
      it('lock true', function(done){
        model.lock(true).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group`  FOR UPDATE')
          done();
        })
      })
      it('lock false', function(done){
        model.lock(false).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group`')
          done();
        })
      })
    })
    describe('distinct', function(){
      it('distinct:view_nums', function(done){
        model.distinct('view_nums').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT Distinct  `view_nums` FROM `think_group`')
          done();
        })
      })
      it('distinct:title', function(done){
        model.distinct('title').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT Distinct  `title` FROM `think_group`')
          done();
        })
      })
    })

    describe('where', function(){
      it('empty where', function(done){
        model.where().select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group`')
          done();
        })
      })
      it('empty where1', function(done){
        model.where('').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group`')
          done();
        })
      })
      it('empty where2', function(done){
        model.where({}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group`')
          done();
        })
      })
      it('where1', function(done){
        model.where({id: 10}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where value undefined', function(done){
        model.where({id: undefined}).select().then(function(){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` = 0 )')
          done();
        })
      })
      it('where =', function(done){
        model.where({id: ['=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where EQ', function(done){
        model.where({id: ['EQ', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where eq', function(done){
        model.where({id: ['eq', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` = 10 )')
          done();
        })
      })
      it('where field not exist', function(done){
        model.where({idxxx: 10}).select().catch(function(err){
          assert.equal(err.message, 'field `idxxx` in where condition is not valid');
          done();
        })
      })
      it('where field with table alias', function(done){
        model.alias('c').where({'c.id': 10}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM think_group AS c WHERE ( c.id = 10 )')
          done();
        })
      })
      it('where !=', function(done){
        model.where({id: ['!=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` != 10 )')
          done();
        })
      })
      it('where NEQ', function(done){
        model.where({id: ['NEQ', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` != 10 )')
          done();
        })
      })
      it('where neq', function(done){
        model.where({id: ['neq', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` != 10 )')
          done();
        })
      })
      it('where <>', function(done){
        model.where({id: ['<>', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` != 10 )')
          done();
        })
      })

      it('where >', function(done){
        model.where({id: ['>', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` > 10 )')
          done();
        })
      })
      it('where GT', function(done){
        model.where({id: ['GT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` > 10 )')
          done();
        })
      })
      it('where gt', function(done){
        model.where({id: ['gt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` > 10 )')
          done();
        })
      })
      it('where >=', function(done){
        model.where({id: ['>=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` >= 10 )')
          done();
        })
      })
      it('where EGT', function(done){
        model.where({id: ['EGT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` >= 10 )')
          done();
        })
      })
      it('where egt', function(done){
        model.where({id: ['egt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` >= 10 )')
          done();
        })
      })

      it('where <', function(done){
        model.where({id: ['<', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` < 10 )')
          done();
        })
      })
      it('where LT', function(done){
        model.where({id: ['LT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` < 10 )')
          done();
        })
      })
      it('where lt', function(done){
        model.where({id: ['lt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` < 10 )')
          done();
        })
      })
      it('where <=', function(done){
        model.where({id: ['<=', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` <= 10 )')
          done();
        })
      })
      it('where ELT', function(done){
        model.where({id: ['ELT', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` <= 10 )')
          done();
        })
      })
      it('where elt', function(done){
        model.where({id: ['elt', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` <= 10 )')
          done();
        })
      })
      it('where NOTLIKE', function(done){
        model.where({title: ['NOTLIKE', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` NOT LIKE 'welefen' )")
          done();
        })
      })
      it('where NOT LIKE', function(done){
        model.where({title: ['NOT LIKE', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` NOT LIKE 'welefen' )")
          done();
        })
      })
      it('where not like', function(done){
        model.where({title: ['not like', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` NOT LIKE 'welefen' )")
          done();
        })
      })
      it('where not like with left %', function(done){
        model.where({title: ['not like', '%welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` NOT LIKE '%welefen' )")
          done();
        })
      })
      it('where not like with right %', function(done){
        model.where({title: ['not like', 'welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` NOT LIKE 'welefen%' )")
          done();
        })
      })
      it('where not like with both %', function(done){
        model.where({title: ['not like', '%welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` NOT LIKE '%welefen%' )")
          done();
        })
      })
      it('where LIKE', function(done){
        model.where({title: ['LIKE', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` LIKE 'welefen' )")
          done();
        })
      })
      it('where like', function(done){
        model.where({title: ['like', 'welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` LIKE 'welefen' )")
          done();
        })
      })
      it('where like with left %', function(done){
        model.where({title: ['like', '%welefen']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` LIKE '%welefen' )")
          done();
        })
      })
      it('where like with right %', function(done){
        model.where({title: ['like', 'welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` LIKE 'welefen%' )")
          done();
        })
      })
      it('where like with both %', function(done){
        model.where({title: ['like', '%welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` LIKE '%welefen%' )")
          done();
        })
      })
      it('where like with both %', function(done){
        model.where({'title|content': ['like', '%welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE '%welefen%') OR (`content` LIKE '%welefen%') )")
          done();
        })
      })
      it('where like with both %', function(done){
        model.where({'title&content': ['like', '%welefen%']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE '%welefen%') AND (`content` LIKE '%welefen%') )")
          done();
        })
      })
      it('where multi like', function(done){
        model.where({title: ['like', ['welefen']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE 'welefen') )")
          done();
        })
      })
      it('where multi like1', function(done){
        model.where({title: ['like', ['welefen', 'suredy']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE 'welefen' OR `title` LIKE 'suredy') )")
          done();
        })
      })
      it('where multi like2', function(done){
        model.where({title: ['like', ['welefen', '%suredy']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE 'welefen' OR `title` LIKE '%suredy') )")
          done();
        })
      })
      it('where multi like3', function(done){
        model.where({title: ['like', ['%welefen', '%suredy%']]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE '%welefen' OR `title` LIKE '%suredy%') )")
          done();
        })
      })
      it('where multi like with AND logic', function(done){
        model.where({title: ['like', ['welefen', 'suredy'], 'AND']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE 'welefen' AND `title` LIKE 'suredy') )")
          done();
        })
      })
      it('where multi like with XOR logic', function(done){
        model.where({title: ['like', ['welefen', 'suredy'], 'XOR']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE 'welefen' XOR `title` LIKE 'suredy') )")
          done();
        })
      })
      it('where multi like with xor logic', function(done){
        model.where({title: ['like', ['welefen', 'suredy'], 'xor']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`title` LIKE 'welefen' XOR `title` LIKE 'suredy') )")
          done();
        })
      })




      it('where IN single value', function(done){
        model.where({id: ['IN', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` = 10 )")
          done();
        })
      })
      it('where IN string value', function(done){
        model.where({id: ['IN', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` IN ('10','20') )")
          done();
        })
      })
      it('where in string value', function(done){
        model.where({id: ['in', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` IN ('10','20') )")
          done();
        })
      })
      it('where IN arr value', function(done){
        model.where({id: ['IN', [10, 20]]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` IN (10,20) )")
          done();
        })
      })
      it('where IN exp', function(done){
        model.where({id: ['IN', '(10,20)', 'exp']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` IN (10,20) )")
          done();
        })
      })

      it('where NOT IN single value', function(done){
        model.where({id: ['NOT IN', 10]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` != 10 )")
          done();
        })
      })
      it('where NOT IN string value', function(done){
        model.where({id: ['NOT IN', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` NOT IN ('10','20') )")
          done();
        })
      })
      it('where not in string value', function(done){
        model.where({id: ['not in', '10,20']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` NOT IN ('10','20') )")
          done();
        })
      })
      it('where NOT IN arr value', function(done){
        model.where({id: ['NOTIN', [10, 20]]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` NOT IN (10,20) )")
          done();
        })
      })
      it('where NOT IN exp', function(done){
        model.where({id: ['notin', '(10,20)', 'exp']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` NOT IN (10,20) )")
          done();
        })
      })

      it('where exp', function(done){
        model.where({id: ['exp', '=10']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`id` =10) )")
          done();
        })
      })
      it('where EXP', function(done){
        model.where({id: ['exp', '=10']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`id` =10) )")
          done();
        })
      })



      it('where multi condition', function(done){
        model.where({id: 10, title: "www"}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` = 10 ) AND ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with OR logic', function(done){
        model.where({id: 10, title: "www", _logic: 'OR'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` = 10 ) OR ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with or logic', function(done){
        model.where({id: 10, title: "www", _logic: 'or'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` = 10 ) OR ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with XOR logic', function(done){
        model.where({id: 10, title: "www", _logic: 'XOR'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` = 10 ) XOR ( `title` = 'www' )")
          done();
        })
      })
      it('where multi condition with xor logic', function(done){
        model.where({id: 10, title: "www", _logic: 'xor'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` = 10 ) XOR ( `title` = 'www' )")
          done();
        })
      })
      it('where string', function(done){
        model.where('id=10').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( id=10 )")
          done();
        })
      })
      it('where string override', function(done){
        model.where('id=10').where('id=20').select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( id=20 )")
          done();
        })
      })
      it('where key has |', function(done){
        model.where({
          'id|title': 10
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`id` = 10) OR (`title` = 10) )")
          done();
        })
      })
      it('where key has &', function(done){
        model.where({
          'id&title': 10
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`id` = 10) AND (`title` = 10) )")
          done();
        })
      })

      it('where BETWEEN', function(done){
        model.where({id: ['BETWEEN', 1, 2]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE (  (`id` BETWEEN 1 AND 2) )")
          done();
        })
      })
      it('where between', function(done){
        model.where({id: ['between', 1, 2]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE (  (`id` BETWEEN 1 AND 2) )")
          done();
        })
      })
      it('where between string', function(done){
        model.where({id: ['between', '1,2']}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE (  (`id` BETWEEN '1' AND '2') )")
          done();
        })
      })



      it('where obj for key value', function(done){
        model.where({id: {
          '>': 10,
          '<': 20
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` > 10 AND `id` < 20 )")
          done();
        })
      })
      it('where obj for key value 1', function(done){
        model.where({id: {
          'GT': 10,
          'LT': 20
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` > 10 AND `id` < 20 )")
          done();
        })
      })
      it('where obj for key value 2', function(done){
        model.where({id: {
          'GT': 10,
          '<=': 20
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` > 10 AND `id` <= 20 )")
          done();
        })
      })
        it('where obj for key value 3', function(done){
        model.where({id: {
          'GT': 10,
          '<=': 20
        }, title: 'welefen'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` > 10 AND `id` <= 20 ) AND ( `title` = 'welefen' )")
          done();
        })
      })
      it('where obj for key value with OR logic', function(done){
        model.where({id: {
          'GT': 10,
          'LT': 20,
          _logic: 'OR'
        }}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` > 10 OR `id` < 20 )")
          done();
        })
      })
      it('where obj for key value with OR logic', function(done){
        model.where({id: {
          'GT': 10,
          'LT': 20,
          _logic: 'OR'
        }, title: 'welefen'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` > 10 OR `id` < 20 ) AND ( `title` = 'welefen' )")
          done();
        })
      })
      it('where extra', function(done){
        model.where({id: [['exp', '= 10 '], ['>', 10], ['<', 20]]}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( (`id` = 10 ) AND (`id` > 10) AND (`id` < 20)  )")
          done();
        })
      })
      it('where mixed', function(done){
        model.where({id: {
          '>=': 10,
          '<=': 20
        }, 'title': ['like', '%welefen%'], date: ['>', '2014-08-12'], _logic: 'OR'}).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `id` >= 10 AND `id` <= 20 ) OR ( `title` LIKE '%welefen%' ) OR ( `date` > '2014-08-12' )")
          done();
        })
      })
      it('where _complex', function(done){
        model.where({
          _complex: {
            id: ['IN', [1, 2, 3]]
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE (  ( `id` IN (1,2,3) ) )")
          done();
        })
      })
      it('where _complex 2', function(done){
        model.where({
          title: 'test',
          _complex: {
            id: ['IN', [1, 2, 3]],
            content: 'www',
            _logic: 'or'
          }
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` = 'test' ) AND (  ( `id` IN (1,2,3) ) OR ( `content` = 'www' ) )")
          done();
        })
      })
      it('where _complex 3', function(done){
        model.where({
          title: 'test',
          _complex: {
            id: ['IN', [1, 2, 3]],
            content: 'www'
          },
          _logic: 'or'
        }).select().then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "SELECT * FROM `think_group` WHERE ( `title` = 'test' ) OR (  ( `id` IN (1,2,3) ) AND ( `content` = 'www' ) )")
          done();
        })
      })


      it('where build sql', function(done){
        D('Cate').field('id').buildSql().then(function(sql){
          model.where({
            id: ['IN', sql, 'exp']
          }).select().then(function(){
            var sql = model.getLastSql().trim();
            assert.equal(sql, 'SELECT * FROM `think_group` WHERE ( `id` IN ( SELECT `id` FROM `think_cate`  ) )')
          })
          done();
        })
      })
    })
    describe('count', function(){
      var model = D('Group');
      it('count id', function(done){
        model.count('id').then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT COUNT(id) AS thinkjs_count FROM `think_group` LIMIT 1')
          done();
        })
      })
      it('count', function(done){
        model.count().then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT COUNT(id) AS thinkjs_count FROM `think_group` LIMIT 1')
          done();
        })
      })
    })

    describe('sum', function(){
      var model = D('Group');
      it('sum view_nums', function(done){
        model.sum('view_nums').then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT SUM(view_nums) AS thinkjs_sum FROM `think_group` LIMIT 1')
          done();
        })
      })
      it('sum', function(done){
        model.sum().then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT SUM(id) AS thinkjs_sum FROM `think_group` LIMIT 1')
          done();
        })
      })
    })

    describe('min', function(){
      var model = D('Group');
      it('min view_nums', function(done){
        model.min('view_nums').then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT MIN(view_nums) AS thinkjs_min FROM `think_group` LIMIT 1')
          done();
        })
      })
      it('min', function(done){
        model.min().then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT MIN(id) AS thinkjs_min FROM `think_group` LIMIT 1')
          done();
        })
      })
    })

    describe('max', function(){
      var model = D('Group');
      it('max view_nums', function(done){
        model.max('view_nums').then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT MAX(view_nums) AS thinkjs_max FROM `think_group` LIMIT 1')
          done();
        })
      })
      it('max', function(done){
        model.max().then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT MAX(id) AS thinkjs_max FROM `think_group` LIMIT 1')
          done();
        })
      })
    })

    describe('avg', function(){
      var model = D('Group');
      it('avg view_nums', function(done){
        model.avg('view_nums').then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT AVG(view_nums) AS thinkjs_avg FROM `think_group` LIMIT 1')
          done();
        })
      })
      it('avg', function(done){
        model.avg().then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, 'SELECT AVG(id) AS thinkjs_avg FROM `think_group` LIMIT 1')
          done();
        })
      })
    })


    describe('add', function(){
      var model = D('Group');
      it('add single field data', function(done){
        model.add({title: 'xxx'}).then(function(sql){
          var sql = model.getLastSql().trim();
          assert.equal(sql, "INSERT INTO `think_group` (`title`) VALUES('xxx')")
          done();
        })
      })
      it('add multi field data', function(done){
        model.add({title: 'xxx', content: "fasdf'suredyf\n"}).then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "INSERT INTO `think_group` (`title`,`content`) VALUES('xxx','fasdf\\'suredyf\\n')")
          done();
        })
      })
      it('add empty data', function(done){
        model.add().catch(function(error){
          assert.equal(error.message, '_DATA_TYPE_INVALID_');
          done()
        })
      })
    })

    describe('addAll', function(){
      var model = D('Group');
      it('add single field data', function(done){
        model.addAll([{title: 'xxx'}]).then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "INSERT INTO `think_group`(`title`) VALUES ('xxx')")
          done();
        })
      })
      it('add single field data 1', function(done){
        model.addAll([{title: 'xxx'}, {title: 'yyyy'}]).then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "INSERT INTO `think_group`(`title`) VALUES ('xxx'),('yyyy')")
          done();
        })
      })
      it('add multi field data', function(done){
        model.addAll([{title: 'xxx', content: "fasdf'suredyf\n"}]).then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "INSERT INTO `think_group`(`title`,`content`) VALUES ('xxx','fasdf\\'suredyf\\n')")
          done();
        })
      })
      it('add multi field data 1', function(done){
        model.addAll([{title: 'xxx', content: "fasdf'suredyf\n"}, {title: 'www', content: 'yyy'}]).then(function(sql){
          var sql = model.getLastSql().trim();
          //console.log(sql)
          assert.equal(sql, "INSERT INTO `think_group`(`title`,`content`) VALUES ('xxx','fasdf\\'suredyf\\n'),('www','yyy')")
          done();
        })
      })
      it('add empty data', function(done){
        model.addAll().catch(function(error){
          assert.equal(error.message, '_DATA_TYPE_INVALID_');
          done()
        })
      })
      it('add empty data1', function(done){
        model.addAll({title: "xxx"}).catch(function(error){
          assert.equal(error.message, '_DATA_TYPE_INVALID_');
          done()
        })
      })
    })
    
    describe('delete', function(){
      var model = D('Group');
      it('delete empty where', function(done){
        model.delete().then(function(error){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, 'DELETE FROM `think_group`')
          done();
        })
      })
      it('delete with where', function(done){
        model.where({
          id: ['<', 10]
        }).delete().then(function(error){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, 'DELETE FROM `think_group` WHERE ( `id` < 10 )')
          done();
        })
      })
      it('delete with options', function(done){
        model.delete({where: {
          id: ['<', 10]
        }}).then(function(error){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, 'DELETE FROM `think_group` WHERE ( `id` < 10 )')
          done();
        })
      })
    })


    describe('update', function(){
      var model = D('Group');
      it('update empty data', function(done){
        model.update().catch(function(error){
          //var sql = model.getLastSql().trim();
          //console.log(error);
          assert.equal(error.message, '_DATA_TYPE_INVALID_')
          done();
        })
      })
      it('update with data', function(done){
        model.update({title: 'wwww'}).catch(function(error){
          //var sql = model.getLastSql().trim();
          //console.log(error);
          assert.equal(error.message, '_OPERATION_WRONG_')
          done();
        })
      })
      it('update with data, has where', function(done){
        model.where({id: 10}).update({title: 'wwww'}).then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `title`='wwww' WHERE ( `id` = 10 )")
          done();
        })
      })
      it('update with data, has options', function(done){
        model.update({title: 'wwww'}, {where: {id: 10}}).then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `title`='wwww' WHERE ( `id` = 10 )")
          done();
        })
      })
    })

    describe('updateAll', function(){
      var model = D('Group');
      it('update empty data', function(done){
        model.updateAll().catch(function(error){
          //var sql = model.getLastSql().trim();
          //console.log(error);
          assert.equal(error.message, '_DATA_TYPE_INVALID_')
          done();
        })
      })
      it('update with single data', function(done){
        model.updateAll({title: 'wwww'}).catch(function(error){
          //var sql = model.getLastSql().trim();
          //console.log(error);
          assert.equal(error.message, '_DATA_TYPE_INVALID_')
          done();
        })
      })
      it('update with single data 1', function(done){
        model.updateAll([{title: 'wwww', id: 10}]).then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `title`='wwww' WHERE ( `id` = 10 )")
          done();
        })
      })
      it('update with single data 2', function(done){
        model.updateAll([{title: 'wwww', id: 10}, {title: 'yyy'}]).catch(function(err){
          //var sql = model.getLastSql().trim();
          //console.log(err);
          assert.equal(err.message, "_OPERATION_WRONG_")
          done();
        })
      })
    })

    describe('updateField', function(){
      var model = D('Group');
      it('update title error', function(done){
        model.updateField('title', 'welefen').catch(function(error){
          assert.equal(error.message, '_OPERATION_WRONG_');
          done();
        })
      })
      it('update title', function(done){
        model.where({id: 10}).updateField('title', 'welefen').then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `title`='welefen' WHERE ( `id` = 10 )");
          done();
        })
      })
    })
    describe('updateInc', function(){
      var model = D('Group');
      it('update view_nums', function(done){
        model.where({id: 10}).updateInc('view_nums').then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums+1 WHERE ( `id` = 10 )");
          done();
        })
      })
      it('update view_nums + 10', function(done){
        model.where({id: 10}).updateInc('view_nums', 10).then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums+10 WHERE ( `id` = 10 )");
          done();
        })
      })
      it('update view_nums + 10A', function(done){
        model.where({id: 10}).updateInc('view_nums', '10A').then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums+10 WHERE ( `id` = 10 )");
          done();
        })
      })
      it('update view_nums + xxx', function(done){
        model.where({id: 10}).updateInc('view_nums', 'xxx').then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums+1 WHERE ( `id` = 10 )");
          done();
        })
      })
    })


    describe('updateDec', function(){
      var model = D('Group');
      it('update view_nums', function(done){
        model.where({id: 10}).updateDec('view_nums').then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums-1 WHERE ( `id` = 10 )");
          done();
        })
      })
      it('update view_nums - 10', function(done){
        model.where({id: 10}).updateDec('view_nums', 10).then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums-10 WHERE ( `id` = 10 )");
          done();
        })
      })
      it('update view_nums - 10A', function(done){
        model.where({id: 10}).updateDec('view_nums', '10A').then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums-10 WHERE ( `id` = 10 )");
          done();
        })
      })
      it('update view_nums - xxx', function(done){
        model.where({id: 10}).updateDec('view_nums', 'xxx').then(function(){
          var sql = model.getLastSql().trim();
          //console.log(sql);
          assert.equal(sql, "UPDATE `think_group` SET `view_nums`=view_nums-1 WHERE ( `id` = 10 )");
          done();
        })
      })
    })

    describe('getField', function(){
      var model = D('Group');
      it('get id field', function(done){
        model.getField('id').then(function(data){
          assert.equal(JSON.stringify(data), '[7565,7564,7563,7562,7561,7560,7559,7558,7557]')
          done();
        })
      })
      it('get id field limit 5', function(done){
        model.getField('id', 5).then(function(data){
          var sql = model.getLastSql().trim();
          assert.equal(sql, 'SELECT `id` FROM `think_group` LIMIT 5')
          done();
        })
      })
      it('get id field by one', function(done){
        model.getField('id', true).then(function(data){
          var sql = model.getLastSql().trim();
          assert.equal(data, 7565);
          assert.equal(sql, 'SELECT `id` FROM `think_group` LIMIT 1')
          done();
        })
      })
      it('get multi field', function(done){
        model.getField('id,view_nums').then(function(data){
          var sql = model.getLastSql().trim();
          assert.equal(JSON.stringify(data), '{"id":[7565,7564,7563,7562,7561,7560,7559,7558,7557],"view_nums":[1965,1558,2335,2013,1425,1433,1994,2035,1118]}');
          assert.equal(sql, 'SELECT `id`,`view_nums` FROM `think_group`')
          done();
        })
      })
    })

  

  })
});
describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})