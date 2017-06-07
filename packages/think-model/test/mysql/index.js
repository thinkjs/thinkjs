const muk = require('muk');
const {test} = require('ava');
const helper = require('think-helper');
const mysqlSocket = require('think-mysql');
const DBConfig = {
  database: 'test',
  prefix: 'think_',
  encoding: 'utf8',
  nums_per_page: 10,
  host: '127.0.0.1',
  port: '',
  user: 'root',
  password: 'root'
};

const model = (name = 'user') => new Base(name, DBConfig);
let Base;

test.before(() => {
  muk(mysqlSocket.prototype, 'query', function(sql){
    if(helper.isObject(sql)){
      sql = sql.sql;
    }
    if (sql === 'SHOW COLUMNS FROM `think_friend`') {
      var data = [
        {"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},
        {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
        {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
        {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
      ];
      return Promise.resolve(data);
    }else if (sql === 'SHOW COLUMNS FROM `think_cate`') {
      var data = [
        {"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
        {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
        {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
        {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
      ];
      return Promise.resolve(data);
    }else if (sql === 'SHOW COLUMNS FROM `think_tag`') {
      var data = [
        {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},
        {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
        {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
        {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
      ];
      return Promise.resolve(data);
    }else if (sql === 'SHOW COLUMNS FROM `think_user`') {
      var data = [
        {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
        {"Field":"title","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
        {"Field":"cate_id","Type":"tinyint(255)","Null":"NO","Key":"MUL","Default":null,"Extra":""},
        {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
      ];
      return Promise.resolve(data);
    }else if (sql === 'SHOW COLUMNS FROM `think_type`') {
      var data = [
        {"Field":"wid","Type":"int(11) unsigned","Null":"NO","Key":"","Default":null,"Extra":""},
        {"Field":"flo","Type":"float(255)","Null":"NO","Key":"UNI","Default":null,"Extra":""},
        {"Field":"is_show","Type":"bool","Null":"NO","Key":"MUL","Default":null,"Extra":""},
        {"Field":"cate_no","Type":"int(11)","Null":"YES","Key":"","Default":null,"Extra":""},
      ];
      return Promise.resolve(data);
    }
    else if (sql === 'SHOW COLUMNS FROM `think_hasid`') {
      var data = [
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
      var data = [
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
    var data = [
      {"id":7565,"title":"title1","cate_id":1,"cate_no":0},
      {"id":7564,"title":"title2","cate_id":2,"cate_no":977},
      {"id":7563,"title":"title3","cate_id":7,"cate_no":281},
      {"id":7562,"title":"title4","cate_id":6,"cate_no":242},
      {"id":7561,"title":"title5","cate_id":3,"cate_no":896},
      {"id":7560,"title":"title6","cate_id":3,"cate_no":897},
      {"id":7559,"title":"title7","cate_id":3,"cate_no":898},
      {"id":7558,"title":"title8","cate_id":17,"cate_no":151},
      {"id":7557,"title":"title9","cate_id":17,"cate_no":152}
    ]
    return Promise.resolve(data);
  });

  Base = muk('../../src/mysql', {
    '../base': muk('../../src/base', {
      './mysql/instance': muk('../../src/mysql/instance', {
        'think-mysql': mysqlSocket
      })
    })
  });
});

test('getSchema', async t => {
  let instance = model();
  let data = await instance.getSchema();
  t.deepEqual(data, { wid:{name: 'wid',type: 'int(11) unsigned',required: false,    primary: false,     unique: false,     auto_increment: false },  title:   { name: 'title',     type: 'varchar(255)',     required: false,          primary: false,     unique: true,     auto_increment: false },  cate_id:   { name: 'cate_id',     type: 'tinyint(255)',     required: false,          primary: false,     unique: false,     auto_increment: false },  cate_no:   { name: 'cate_no',     type: 'int(11)',     required: false,          primary: false,     unique: false, auto_increment: false } });
});
test('getSchema, exist', async t => {
  let instance = model();
  await instance.getSchema();
  let data = await instance.getSchema();
  t.deepEqual(data, { wid:{name: 'wid',type: 'int(11) unsigned',required: false,     primary: false,     unique: false,     auto_increment: false },  title:   { name: 'title',     type: 'varchar(255)',     required: false,          primary: false,     unique: true,     auto_increment: false },  cate_id:   { name: 'cate_id',     type: 'tinyint(255)',     required: false,          primary: false,     unique: false,     auto_increment: false },  cate_no:   { name: 'cate_no',     type: 'int(11)',     required: false,          primary: false,     unique: false, auto_increment: false } });
});
test('getSchema, type', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.getSchema('think_type');
  t.deepEqual(data, { wid:  { name: 'wid',    type: 'int(11) unsigned',    required: false,    primary: false,    unique: false,    auto_increment: false }, flo:  { name: 'flo',    type: 'float(255)',    required: false,        primary: false,    unique: true,    auto_increment: false }, is_show:  { name: 'is_show',    type: 'bool',    required: false,        primary: false,    unique: false,    auto_increment: false }, cate_no:  { name: 'cate_no',    type: 'int(11)',    required: false,        primary: false,    unique: false,    auto_increment: false } })
  t.is(instance.getLastSql(), 'SHOW COLUMNS FROM `think_type`');
});
test('getSchema, change pk', async t => {
  t.plan(2);

  let instance = model('tag');
  instance.tablePrefix = 'think_';
  await instance.getSchema('think_tag');
  
  t.is(instance.getLastSql(), 'SHOW COLUMNS FROM `think_tag`');
  t.is(instance.pk, 'wid');
})
test('getSchema, change pk, getPk', async t => {
  let instance = model('tag');
  instance.tablePrefix = 'think_';
  try {
    let data = await instance.getSchema('think_tag');
    let pk = await instance.getPk();

    //t.is(instance.getLastSql(), 'SHOW COLUMNS FROM `think_tag`');
    t.is(pk, 'wid');
  } catch(e) {
    console.log(e.stack);
  }
})
test('getUniqueField', async t => {
  let instance = model('tag');
  instance.tablePrefix = 'think_';
  let data = await instance.getUniqueField();
  t.is(data, 'title');
})
test('getUniqueField, with data', async t => {
  let instance = model('tag');
  instance.tablePrefix = 'think_';
  let data = await instance.getUniqueField({
    title: 'welefen'
  });
  t.is(data, 'title');
})
test('getUniqueField, with data, not match', async t => {
  let instance = model('tag');
  instance.tablePrefix = 'think_';
  let data = await instance.getUniqueField({
    title111: 'welefen'
  });
  t.is(data, undefined);
})
test('parseType', t => {
  t.plan(9);

  let instance = model('tag');
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

  t.is(instance.parseType('id', 10), 10);
  t.is(instance.parseType('id'), 0);
  t.is(instance.parseType('bid', 10), 10);
  t.is(instance.parseType('cid', 10.5), 10.5);
  t.is(instance.parseType('cid'), 0.0);
  t.is(instance.parseType('did', 10), 10);
  t.is(instance.parseType('bool', 10), true);
  t.is(instance.parseType('name', 'www'), 'www');
  t.is(instance.parseType('name1', 'www'), 'www');
})
test('build sql', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let sql = await instance.where('id=1')
    .field('name,title')
    .group('name')
    .limit(10)
    .buildSql();

  if(config.camel_case){
    // camel case
    t.is(sql, '( SELECT `name` AS `name`,`title` AS `title` FROM `think_user` WHERE ( id=1 ) GROUP BY `name` LIMIT 10 )');
  } else {
    // normal
    t.is(sql, '( SELECT `name`,`title` FROM `think_user` WHERE ( id=1 ) GROUP BY `name` LIMIT 10 )');
  }
})
test('build sql 2', async t => {
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let instance = new Base('hasid', config);
  let sql = await instance.where({_id: 'www'}).field('name,title').group('name').limit(10).buildSql();
  if(config.camel_case){
    // camel case
    t.is(sql, "( SELECT `name` AS `name`,`title` AS `title` FROM `think_hasid` WHERE ( `_id` = 'www' ) GROUP BY `name` LIMIT 10 )");
  } else {
    // normal
    t.is(sql, "( SELECT `name`,`title` FROM `think_hasid` WHERE ( `_id` = 'www' ) GROUP BY `name` LIMIT 10 )");
  }
})

test('parseOptions', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let options = await instance.parseOptions();

  if(config.camel_case) {
    // camel case
    t.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user', field: ['`wid` AS `wid`', '`title` AS `title`', '`cate_id` AS `cateId`', '`cate_no` AS `cateNo`'], where: {}});
  } else {
    // normal
    t.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user' });
  }
})
test('parseOptions, has oriOpts', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let options = await instance.parseOptions({
    where: {
      name: 'welefen'
    }
  });
  if(config.camel_case) {
    // camel case
    t.deepEqual(options, { where: { name: 'welefen' },table: 'think_user',tablePrefix: 'think_',model: 'user', field: ['`wid` AS `wid`', '`title` AS `title`', '`cate_id` AS `cateId`', '`cate_no` AS `cateNo`']})
  } else {
    // normal
    t.deepEqual(options, { where: { name: 'welefen' },table: 'think_user',tablePrefix: 'think_',model: 'user' })
  }
})
test('parseOptions, has oriOpts', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let options = await instance.parseOptions(1000);
  if(config.camel_case) {
    // camel case
    t.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user', where: { id: '1000' } ,field: ['`wid` AS `wid`', '`title` AS `title`', '`cate_id` AS `cateId`', '`cate_no` AS `cateNo`']})
  } else {
    // normal
    t.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user', where: { id: '1000' } })
  }
})
test('parseOptions, has alias', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let options = await instance.alias('a').parseOptions(1000);
  if(config.camel_case) {
    // camel case
    t.deepEqual(options, { alias: 'a', table: 'think_user AS a', tablePrefix: 'think_', model: 'user', where: { id: '1000' } ,field: ['`wid` AS `wid`', '`title` AS `title`', '`cate_id` AS `cateId`', '`cate_no` AS `cateNo`']})
  } else {
    // normal
    t.deepEqual(options, { alias: 'a', table: 'think_user AS a', tablePrefix: 'think_', model: 'user', where: { id: '1000' } })
  }
})
test('parseOptions, field reverse', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let options = await instance.alias('a').field('title', true).parseOptions(1000);
  if(config.camel_case) {
    // camel case
    t.deepEqual(options, { alias: 'a',  field: [ '`wid` AS `wid`', '`cate_id` AS `cateId`', '`cate_no` AS `cateNo`' ],  fieldReverse: false,  table: 'think_user AS a',  tablePrefix: 'think_',  model: 'user',  where: { id: '1000' } })
  } else {
    // normal
    t.deepEqual(options, { alias: 'a',  field: [ 'wid', 'cate_id', 'cate_no' ],  fieldReverse: false,  table: 'think_user AS a',  tablePrefix: 'think_',  model: 'user',  where: { id: '1000' } })
  }
})
// test('parseOptions, key is not valid', async t => {
//   let instance = model();
//   try {
//     await instance.alias('a').where({
//       'fasdf$www': 'welefen'
//     }).parseOptions(1000);
//     t.pass();
//   } catch(e) {
//     t.fail();
//   }
// })
test('alias can not in show columns', async t => {
  let instance = new Base('user222', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  try {
    await instance.alias('a').select();
    t.pass();
  } catch(e) {
    t.fail();
  }
})
test('parseWhereOptions', t => {
  let instance = model();
  let options = instance.parseWhereOptions('10,20');
  t.deepEqual(options, { where: { id: { IN: '10,20' } } })
})
test('add data, empty', async t => {
  let instance = model();
  try {
    await instance.add();
    t.fail();
  } catch(e) {
    t.deepEqual(instance._data, {});
  }
})
test('add data, has default', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: 'haha'
    }
  }
  let insertId = await instance.add({
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`name`,`title`) VALUES ('haha','test')");
})
test('add data, has default null', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: null
    }
  }

  let insertId = await instance.add({
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`title`) VALUES ('test')");
})
test('add data, has default empty', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: ''
    }
  }
  let insertId = await instance.add({
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`title`) VALUES ('test')");
})
test('add data, has default undefined', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: undefined
    }
  }
  let insertId = await instance.add({
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`title`) VALUES ('test')");
})
test('add data, has default 0', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: 0
    }
  }
  let insertId = await instance.add({
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`name`,`title`) VALUES (0,'test')");
})
test('add data, has default null, value 0', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: null
    }
  }
  let insertId = await instance.add({
    name: 0,
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`name`,`title`) VALUES (0,'test')");
})
test('add data, has default empty, value 0', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: ''
    }
  }
  let insertId = await instance.add({
    name: 0,
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`name`,`title`) VALUES (0,'test')");
})
test('add data, has default 0, value 1', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: 0
    }
  }
  let insertId = await instance.add({
    name: 1,
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`name`,`title`) VALUES (1,'test')");
})
test('add data, has default function', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: function(){return 'haha'}
    }
  }
  let insertId = await instance.add({
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`name`,`title`) VALUES ('haha','test')");
})
test('add data, has default function, this', async t => {
  let instance = new Base('user', helper.extend({}, DBConfig, {test: 111}));
  instance.tablePrefix = 'think_';
  instance.schema = {
    name: {
      default: function(){return this.title + '_name'}
    }
  }
  let insertId = await instance.add({
    title: 'test'
  });
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`name`,`title`) VALUES ('test_name','test')");
})
test('add data, has data', async t => {
  t.plan(2);

  let instance = model();
  let insertId = await instance.add({
    name: 'welefen',
    title: 'test'
  });
  t.is(insertId, 100);
  t.is(instance.getLastSql(), "INSERT INTO `think_user` (`title`) VALUES ('test')");
})
test('replace data, has data', async t => {
  t.plan(2);

  let instance = model();
  let insertId = await instance.add({
    name: 'welefen',
    title: 'test'
  }, true);
  t.is(insertId, 1000);
  t.is(instance.getLastSql(), "REPLACE INTO `think_user` (`title`) VALUES ('test')");
})
test('thenAdd, not exist', async t => {
  let instance = model();
  let data = await instance.where({id: 897}).thenAdd({
    name: 'welefen',
    title: 'test'
  });
  //t.deepEqual(data, { id: 7565, type: 'exist' })
  t.deepEqual(data, { id: 100, type: 'add' })
})
test('thenAdd, exist', async t => {
  let instance = model();
  let data = await instance.where({id: 898}).thenAdd({
    name: 'welefen',
    title: 'test'
  });
  t.deepEqual(data, { id: 898, type: 'exist' })
  //t.deepEqual(data, { id: 898, type: 'exist' })
})
test('add many', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.addMany([{
    name: 'name1',
    title: 'title1'
  }, {
    name: 'name2',
    title: 'title2'
  }]);
  t.deepEqual(data, [ 565, 566 ]);
  t.is(instance.getLastSql(), "INSERT INTO `think_user`(`title`) VALUES ('title1'),('title2')");
})
test('add many, replace', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.addMany([{
    name: 'name1',
    title: 'title1'
  }, {
    name: 'name2',
    title: 'title2'
  }], true);

  t.deepEqual(data, [ 343, 344 ]);
  t.is(instance.getLastSql(), "REPLACE INTO `think_user`(`title`) VALUES ('title1'),('title2')");
})
test('add many, not array', async t => {
  try {
    await model().addMany();
    t.fail();
  } catch(e) {
    t.pass();
  }
})
test('delete data', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.where({id: 1}).delete();

  t.is(instance.getLastSql(), "DELETE FROM `think_user` WHERE ( `id` = 1 )");
  t.is(data, 3);
})
test('update, empty', async t => {
  t.plan(2);

  let instance = model();
  try {
    await instance.where({id: 100}).update();
    t.fail();
  } catch(e) {
    t.deepEqual(instance._options, {});
    t.deepEqual(instance._data, {});
  }
})
test('update', async t => {
  t.plan(2);

  let instance = model();
  let rows = await instance.where({id: 101}).update({
    name: 'name1',
    title: 'title1'
  });

  t.is(instance.getLastSql(), "UPDATE `think_user` SET `title`='title1' WHERE ( `id` = 101 )")
  t.is(rows, 1);
})
// test('update, readonlyFields', async t => {
//   instance.readonlyFields = ['cate_id'];
//   instance.where({id: 401}).update({
//     cate_id: '1111',
//     title: 'title1'
//   }).then(function(rows){
//     var sql = instance.getLastSql();
//     t.is(sql, "UPDATE `think_user` SET `title`='title1' WHERE ( `id` = 401 )")
//     instance.readonlyFields = [];
//     done();
//   }).catch(function(err){
//     console.log(err.stack)
//   })
// })
test('update, missing where condition', async t => {
  t.plan(2);

  let instance = model();
  try {
    await instance.update({title: 'www'});
    t.fail();
  } catch(e) {
    t.deepEqual(instance._options, {});
    t.deepEqual(instance._data, {});
  }
})
test('update, where condition from data', async t => {
  t.plan(2);

  let instance = model('cate');
  instance.tablePrefix = 'think_';
  
  try {
    let rows = await instance.update({
      id: 102,
      name: 'name1',
      title: 'title1'
    });
      
    t.is(instance.getLastSql(), "UPDATE `think_cate` SET `title`='title1' WHERE ( `id` = 102 )")
    t.is(rows, 0);
  } catch(e) {
    console.log(e.stack);
    t.fail();
  }
})
test('update many, empty', async t => {
  try {
    await model().where({id: 104}).updateMany();
    t.fail();
  } catch(e) {
    t.pass();
  }
})
test('update many', async t => {
  t.plan(2);

  let instance = model('cate');
  instance.tablePrefix = 'think_';
  
  let rows = await instance.updateMany([{
    id: 105,
    name: 'name1',
    title: 'title1'
  }]);
  t.is(instance.getLastSql(), "UPDATE `think_cate` SET `title`='title1' WHERE ( `id` = 105 )")
  t.is(rows, 0);
})
test('update many 2', async t => {
  t.plan(2);

  let instance = model('cate');
  instance.tablePrefix = 'think_';
  let rows = await instance.updateMany([{
    id: 100,
    name: 'name1',
    title: 'title1'
  },{
    id: 106,
    name: 'name2',
    title: 'title2'
  }]);
  t.is(instance.getLastSql(), "UPDATE `think_cate` SET `title`='title2' WHERE ( `id` = 106 )")
  t.is(rows, 4);
})
test('increment', async t => {
  let instance = model();
  let data = await instance.where({1: 1}).increment('title', 10);
  t.is(instance.getLastSql(), "UPDATE `think_user` SET `title`=`title`+10 WHERE ( 1 = 1 )");
  // t.is(data, 1);
})
test('increment, default step', async t => {
  let instance = model();
  let data = await instance.where({1: 1}).increment('title', 1, true);
  t.is(instance.getLastSql(), "UPDATE `think_user` SET `title`=`title`+1 WHERE ( 1 = 1 )");
  //t.is(data, 1)
})
test('decrement', async t => {
  let instance = model();
  let data = await instance.where({1: 1}).decrement('title', 10);
  t.is(instance.getLastSql(), "UPDATE `think_user` SET `title`=`title`-10 WHERE ( 1 = 1 )");
  //t.is(data, 1)
})
test('decrement, default step', async t => {
  let instance = model();
  let data = await instance.where({1: 1}).decrement('title');
  t.is(instance.getLastSql(), "UPDATE `think_user` SET `title`=`title`-1 WHERE ( 1 = 1 )");
  //t.is(data, 1)
})
test('find', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.where({id: 100}).find();
  if(config.camel_case) {
    //console.log(`sql: ${instance.getLastSql()}`);
    //console.log(data);
    t.is(instance.getLastSql(), "SELECT `wid` AS `wid`,`title` AS `title`,`cate_id` AS `cateId`,`cate_no` AS `cateNo` FROM `think_user` WHERE ( `id` = 100 ) LIMIT 1");
    //t.deepEqual(data, { id: 7565, title: 'title1', cateId: 1, cateNo: 0 })
  } else {
    t.plan(2);

    t.is(instance.getLastSql(), "SELECT * FROM `think_user` WHERE ( `id` = 100 ) LIMIT 1");
    t.deepEqual(data, { id: 7565, title: 'title1', cate_id: 1, cate_no: 0 })
  }
})
test('find, camelCase 1', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.field("blog_name,blog_title,createTime").where({groupId: 100}).find();

  if(config.camel_case) {
    t.is(instance.getLastSql(), "SELECT `blog_name` AS `blogName`,`blog_title` AS `blogTitle`,`createTime` AS `createTime` FROM `think_user` WHERE ( `group_id` = 100 ) LIMIT 1");
  } else {
    t.is(instance.getLastSql(), "SELECT `blog_name`,`blog_title`,`createTime` FROM `think_user` WHERE ( `groupId` = 100 ) LIMIT 1");
  }
})
test('find, camelCase 2', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.field("blog_name,blog_title,createTime").where({group_id: 100}).find();

  if(config.camel_case) {
    t.is(instance.getLastSql(), "SELECT `blog_name` AS `blogName`,`blog_title` AS `blogTitle`,`createTime` AS `createTime` FROM `think_user` WHERE ( `group_id` = 100 ) LIMIT 1");
  } else {
    t.is(instance.getLastSql(), "SELECT `blog_name`,`blog_title`,`createTime` FROM `think_user` WHERE ( `group_id` = 100 ) LIMIT 1");
  }
})
test('select', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});

  let data = await instance.where({id: 100}).limit(1).select();
  if(config.camel_case) {
    t.is(instance.getLastSql(), "SELECT `wid` AS `wid`,`title` AS `title`,`cate_id` AS `cateId`,`cate_no` AS `cateNo` FROM `think_user` WHERE ( `id` = 100 ) LIMIT 1");
  }else{
    t.plan(2);

    t.is(instance.getLastSql(), "SELECT * FROM `think_user` WHERE ( `id` = 100 ) LIMIT 1");
    t.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }]);
  }
})
test('select, order has keyword', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.where({id: 100}).limit(1).order('count(id) DESC').select();

  if(config.camel_case) {
    t.is(instance.getLastSql(), "SELECT `wid` AS `wid`,`title` AS `title`,`cate_id` AS `cateId`,`cate_no` AS `cateNo` FROM `think_user` WHERE ( `id` = 100 ) ORDER BY count(id) DESC LIMIT 1");
  } else {
    t.is(instance.getLastSql(), "SELECT * FROM `think_user` WHERE ( `id` = 100 ) ORDER BY count(id) DESC LIMIT 1");
  }
  //t.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }])
})
test('select, order has keyword 1', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  
  let data = await instance.where({id: 100}).limit(1).order('INSTR( topicTitle, "ha" ) > 0 DESC').select();
  if(config.camel_case) {
    t.is(instance.getLastSql(), 'SELECT `wid` AS `wid`,`title` AS `title`,`cate_id` AS `cateId`,`cate_no` AS `cateNo` FROM `think_user` WHERE ( `id` = 100 ) ORDER BY INSTR( topicTitle, "ha" ) > 0 DESC LIMIT 1');
  } else {
    t.is(instance.getLastSql(), 'SELECT * FROM `think_user` WHERE ( `id` = 100 ) ORDER BY INSTR( topicTitle, "ha" ) > 0 DESC LIMIT 1');
  }
  //t.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }])
})
test('select, field has keyword', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.field("id, instr('30,35,31,',id+',') as d").where({id: 100}).limit(1).order('count(id)').select();

  if(!config.camel_case) {
    // 驼峰式不适合这种写法(带mysql函数)
    t.is(instance.getLastSql(), "SELECT id, instr('30,35,31,',id+',') as d FROM `think_user` WHERE ( `id` = 100 ) ORDER BY count(id) LIMIT 1");
  }
  //t.deepEqual(data, [{ id: 7565, title: 'title1', cate_id: 1, cate_no: 0 }])
})
test('select, camelCase 1', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.field("blog_name,blog_title,createTime").where({groupId: 100}).limit(1).order('count(id)').select();

  if(config.camel_case) {
    t.is(instance.getLastSql(), "SELECT `blog_name` AS `blogName`,`blog_title` AS `blogTitle`,`createTime` AS `createTime` FROM `think_user` WHERE ( `group_id` = 100 ) ORDER BY count(id) LIMIT 1");
  }else{
    t.is(instance.getLastSql(), "SELECT `blog_name`,`blog_title`,`createTime` FROM `think_user` WHERE ( `groupId` = 100 ) ORDER BY count(id) LIMIT 1");
  }
})
test('select, camelCase 2', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.field("blog_name,blog_title,createTime").where({group_id: 100}).limit(1).order('count(id)').select();
  if(config.camel_case) {
    t.is(instance.getLastSql(), "SELECT `blog_name` AS `blogName`,`blog_title` AS `blogTitle`,`createTime` AS `createTime` FROM `think_user` WHERE ( `group_id` = 100 ) ORDER BY count(id) LIMIT 1");
  } else {
    t.is(instance.getLastSql(), "SELECT `blog_name`,`blog_title`,`createTime` FROM `think_user` WHERE ( `group_id` = 100 ) ORDER BY count(id) LIMIT 1");
  }
})
test('select add', async t => {
  let instance = model();
  try {
    let data = await instance.selectAdd({
      table: 'think_tag',
      where: {name: 'test'}
    });
    let sql = instance.getLastSql();
    t.is(sql, "INSERT INTO `think_user` (`wid`,`title`,`cate_id`,`cate_no`) SELECT * FROM `think_tag` WHERE ( `name` = 'test' )");
  } catch(e) {
    console.log(e.stack);
    t.fail();
  }
})
test('select add, instance', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let instance1 = new Base('tag', config);
  instance1.tablePrefix = 'think_';
  instance1.where({name: 'test'});
  let data = await instance.selectAdd(instance1);

  let sql = instance.getLastSql();
  if(config.camel_case) {
    t.is(sql, "INSERT INTO `think_user` (`wid`,`title`,`cate_id`,`cate_no`) SELECT `wid` AS `wid`,`title` AS `title`,`cate_id` AS `cateId`,`cate_no` AS `cateNo` FROM `think_tag` WHERE ( `name` = 'test' )")
  } else {
    t.is(sql, "INSERT INTO `think_user` (`wid`,`title`,`cate_id`,`cate_no`) SELECT * FROM `think_tag` WHERE ( `name` = 'test' )")
  }
})
test('count select', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.where({name: 'test'}).page(3).countSelect();

  if(config.camel_case) {
    //t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]});
  } else {
    t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]});
  }
})
test('count select, no page', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  
  let data = await instance.where({name: 'test'}).countSelect();
  var sql = instance.getLastSql();
  if(config.camel_case){
    //t.is(sql, "SELECT `wid` AS `wid`,`title` AS `title`,`cate_id` AS `cateId`,`cate_no` AS `cateNo` FROM `think_user` WHERE ( `name` = 'test' ) LIMIT 0,10");
  } else {
    t.is(sql, "SELECT * FROM `think_user` WHERE ( `name` = 'test' ) LIMIT 0,10");
  }
  //console.log(sql)
  //t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]})
})
test('count select, pageFlag: true', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.where({name: 'test'}).page(3).countSelect(true);

  if(config.camel_case){
    //t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cateId":1,"cateNo":0},{"id":7564,"title":"title2","cateId":2,"cateNo":977},{"id":7563,"title":"title3","cateId":7,"cateNo":281},{"id":7562,"title":"title4","cateId":6,"cateNo":242},{"id":7561,"title":"title5","cateId":3,"cateNo":896},{"id":7560,"title":"title6","cateId":3,"cateNo":897},{"id":7559,"title":"title7","cateId":3,"cateNo":898},{"id":7558,"title":"title8","cateId":17,"cateNo":151},{"id":7557,"title":"title9","cateId":17,"cateNo":152}]});
  } else {
    t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]});
  }
})
test('count select, with count', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.where({name: 'test'}).page(3).countSelect(399);

  if(config.camel_case){
    //t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cateId":1,"cateNo":0},{"id":7564,"title":"title2","cateId":2,"cateNo":977},{"id":7563,"title":"title3","cateId":7,"cateNo":281},{"id":7562,"title":"title4","cateId":6,"cateNo":242},{"id":7561,"title":"title5","cateId":3,"cateNo":896},{"id":7560,"title":"title6","cateId":3,"cateNo":897},{"id":7559,"title":"title7","cateId":3,"cateNo":898},{"id":7558,"title":"title8","cateId":17,"cateNo":151},{"id":7557,"title":"title9","cateId":17,"cateNo":152}]});
  } else {
    t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]});
  }
})
test('count select, with count, beyond pages', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.where({name: 'test'}).page(300).countSelect(true);

  if(config.camel_case){
    //t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cateId":1,"cateNo":0},{"id":7564,"title":"title2","cateId":2,"cateNo":977},{"id":7563,"title":"title3","cateId":7,"cateNo":281},{"id":7562,"title":"title4","cateId":6,"cateNo":242},{"id":7561,"title":"title5","cateId":3,"cateNo":896},{"id":7560,"title":"title6","cateId":3,"cateNo":897},{"id":7559,"title":"title7","cateId":3,"cateNo":898},{"id":7558,"title":"title8","cateId":17,"cateNo":151},{"id":7557,"title":"title9","cateId":17,"cateNo":152}]});
  } else {
    //console.log(JSON.stringify(data))
    t.deepEqual(data, {"count":399,"totalPages":40,"pagesize":10,"currentPage":1,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]});
  }
})
test('count select, with count, beyond pages 2', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  let data = await instance.where({name: 'test'}).page(300).countSelect(false);

  if(config.camel_case){
    //t.deepEqual(data, {"count":399,"totalPages":40,"currentPage":3,"pagesize":10,"data":[{"id":7565,"title":"title1","cateId":1,"cateNo":0},{"id":7564,"title":"title2","cateId":2,"cateNo":977},{"id":7563,"title":"title3","cateId":7,"cateNo":281},{"id":7562,"title":"title4","cateId":6,"cateNo":242},{"id":7561,"title":"title5","cateId":3,"cateNo":896},{"id":7560,"title":"title6","cateId":3,"cateNo":897},{"id":7559,"title":"title7","cateId":3,"cateNo":898},{"id":7558,"title":"title8","cateId":17,"cateNo":151},{"id":7557,"title":"title9","cateId":17,"cateNo":152}]});
  } else {
    t.deepEqual(data, {"count":399,"totalPages":40,"pagesize":10,"currentPage":40,"data":[{"id":7565,"title":"title1","cate_id":1,"cate_no":0},{"id":7564,"title":"title2","cate_id":2,"cate_no":977},{"id":7563,"title":"title3","cate_id":7,"cate_no":281},{"id":7562,"title":"title4","cate_id":6,"cate_no":242},{"id":7561,"title":"title5","cate_id":3,"cate_no":896},{"id":7560,"title":"title6","cate_id":3,"cate_no":897},{"id":7559,"title":"title7","cate_id":3,"cate_no":898},{"id":7558,"title":"title8","cate_id":17,"cate_no":151},{"id":7557,"title":"title9","cate_id":17,"cate_no":152}]});
  }
})
test('count, with join', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  await instance.alias('c').join({
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
  ].join(',')).page(1, 20).count('c.channel_id');

  // 驼峰式不适用于这么复杂的field
  if(!config.camel_case){
    t.is(instance.getLastSql(), "SELECT COUNT(c.channel_id) AS think_count FROM think_user AS c LEFT JOIN think_product.app AS `app` ON `c`.`channel_id` = `app`.`app_id` LIMIT 1")
  }
})
test('countSelect, with join 2', async t => {
  let instance = model();
  let config = helper.extend({}, DBConfig, {prefix: 'think_'});
  await instance.alias('c').join({
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
  ].join(',')).page(1, 20).countSelect();
  
  // 驼峰式不适用于这么复杂的field
  if(!config.camel_case){
    t.is(sql = instance.getLastSql(), "SELECT c.channel_id as id,c.name as name,c.identifier as identifier,app.app_id as app_id,app.app_name as app_name,app.appnm as appnm FROM think_user AS c LEFT JOIN think_product.app AS `app` ON `c`.`channel_id` = `app`.`app_id` LIMIT 0,20");
  }
})
test('count select, with group', async t => {
  let instance = model();
  let data = await instance.where({name: 'test'}).page(1).group('name').countSelect(false);
  t.is(instance.getLastSql(), "SELECT * FROM `think_user` WHERE ( `name` = 'test' ) GROUP BY `name` LIMIT 0,10");
})
test('get field', async t => {
  let instance = model();
  let data = await instance.where({name: 'welefen'}).getField('title');
  
  //console.log(data);
  t.deepEqual(data, [ 'title1', 'title2' ]);
})
test('get field, with limit', async t => {
  let instance = model();
  let data = await instance.where({name: 'welefen'}).getField('title', 1);
  //console.log(data);
  t.deepEqual(data, [ 'title1' ]);
})
test('get field, with true', async t => {
  let instance = model();
  let data = await instance.where({name: 'welefen'}).getField('title', true);
  //console.log(data);
  t.deepEqual(data, 'title1');
})
test('get field, with mutil', async t => {
  let instance = model();
  let data = await instance.where({name: 'welefen'}).getField('title,cate_no', true);
  //console.log(data);
  t.deepEqual(data, { title: 'title1', cate_no: 1000 });
})
test('get field, with mutil 1', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.where({name: 'welefen'}).getField('title,cate_no', 3);

  let sql = instance.getLastSql();
  t.is(sql, "SELECT `title`,`cate_no` FROM `think_user` WHERE ( `name` = 'welefen' ) LIMIT 3");
  t.deepEqual(data, { title: [ 'title1', 'title2', 'title3' ], cate_no: [ 1000, 1001, 1002 ] });
})
test('expain', async t => {
  let instance = model();
  let data = await instance.where({name: 'welefen'}).explain(true).getField('title,cate_no', 3);

  let sql = instance.getLastSql();
  t.is(sql, "EXPLAIN SELECT `title`,`cate_no` FROM `think_user` WHERE ( `name` = 'welefen' ) LIMIT 3");
})
test('count', async t => {
  let data = await model().count();
  t.is(data, 40000);
})
test('sum', async t => {
  t.plan(2);
  let instance = model();
  let data = await instance.sum();

  let sql = instance.getLastSql();
  t.is(sql, "SELECT SUM(id) AS think_sum FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('sum, with field', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.sum('id');
  let sql = instance.getLastSql();
  t.is(sql, "SELECT SUM(`id`) AS think_sum FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('sum, with field key', async t => {
  let instance = model();
  let data = await instance.sum('key');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT SUM(`key`) AS think_sum FROM `think_user` LIMIT 1");
})
test('min', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.min();

  let sql = instance.getLastSql();
  t.is(sql, "SELECT MIN(id) AS think_min FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('min, with field', async t => {
  t.plan(2);
  
  let instance = model();
  let data = await instance.min('id');
  
  let sql = instance.getLastSql();
  t.is(sql, "SELECT MIN(`id`) AS think_min FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('min, with field key', async t => {
  let instance = model();
  let data = await instance.min('key');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT MIN(`key`) AS think_min FROM `think_user` LIMIT 1");
})
test('max', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.max();
  
  let sql = instance.getLastSql();
  t.is(sql, "SELECT MAX(id) AS think_max FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('max, with field', async t => {
  t.plan(2);
  
  let instance = model();
  let data = await instance.max('id');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT MAX(`id`) AS think_max FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('max, with field key', async t => {
  let instance = model();
  let data = await instance.max('key');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT MAX(`key`) AS think_max FROM `think_user` LIMIT 1");
})
test('avg', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.avg();

  let sql = instance.getLastSql();
  t.is(sql, "SELECT AVG(id) AS think_avg FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('avg, with field', async t => {
  t.plan(2);

  let instance = model();
  let data = await instance.avg('id');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT AVG(`id`) AS think_avg FROM `think_user` LIMIT 1");
  t.is(data, 1000);
})
test('avg, with field key', async t => {
  let instance = model();
  let data = await instance.avg('key');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT AVG(`key`) AS think_avg FROM `think_user` LIMIT 1");
})
test('query', async t => {
  let instance = model();
  let data = await instance.query('SELECT * FROM __TABLE__ ');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT * FROM `think_user` ");
})
test('query, tag', async t => {
  let instance = model();
  let data = await instance.query('SELECT * FROM __TAG__ ');
  
  let sql = instance.getLastSql();
  t.is(sql, "SELECT * FROM `think_tag` ");
})
test('execute, tag', async t => {
  let instance = model();
  let data = await instance.execute('UPDATE __TAG__ set name=1 where name=2');
  
  let sql = instance.getLastSql();
  t.is(sql, "UPDATE `think_tag` set name=1 where name=2");
})
// test('startTrans', async t => {
//   let instance = model();
//   let data = await instance.startTrans();

//   let sql = instance.getLastSql();
//   t.is(sql, 'START TRANSACTION');
// })
// test('commit', async t => {
//   let instance = model();
  
//   try {
//     await instance.startTrans();
//     let data = await instance.commit();
    
//     let sql = instance.getLastSql();
//     t.is(sql, '');
//   } catch(e) {
//     console.log(e.stack);
//     t.fail();
//   }
// })
// test('rollback', async t => {
//   let instance = model();
//   await instance.startTrans();
//   await instance.rollback();
//   let sql = instance.getLastSql();
//   t.is(sql, '');
// })
// test('transaction, commit', async t => {
//   let instance = model();
//   await instance.transaction(function() {
//     return instance.add({
//       name: 'welefen',
//       title: 'wwww'
//     });
//   });
//   t.is(instance.getLastSql(), '');
// })
// test('transaction, rollback', async t => {
//   let instance = model();
//   await instance.transaction(function() {
//     return Promise.reject(new Error('error'));
//   });
//   t.is(instance.getLastSql(), '');
// })
test('distinct with count', async t => {
  let instance = model();
  let data = await instance.count('distinct name');

  let sql = instance.getLastSql();
  t.is(sql, "SELECT COUNT(distinct name) AS think_count FROM `think_user` LIMIT 1");
  //t.is(data, 1000);
})
test.after(() => muk.restore());