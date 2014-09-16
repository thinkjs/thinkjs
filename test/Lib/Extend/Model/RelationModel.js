var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www')
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));


var MysqlSocket = thinkRequire('MysqlSocket');
var RelationModel = thinkRequire('RelationModel');

describe('before', function(){
  it('before', function(){
    C('db_prefix', 'think_');
    muk(MysqlSocket.prototype, 'query', function(sql){
      sql = sql.trim();
      //console.log(sql)
      if (sql === 'SHOW COLUMNS FROM `think_post`') {
        var data = [{"Field":"id","Type":"int(20) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"datetime","Type":"datetime","Null":"NO","Key":"MUL","Default":"0000-00-00 00:00:00","Extra":""},{"Field":"content","Type":"longtext","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"title","Type":"varchar(255)","Null":"NO","Key":"","Default":"","Extra":""},{"Field":"alias_title","Type":"varchar(200)","Null":"NO","Key":"MUL","Default":"","Extra":""},{"Field":"status","Type":"varchar(255)","Null":"NO","Key":"","Default":"publish","Extra":""},{"Field":"markdown_content","Type":"longtext","Null":"NO","Key":"","Default":null,"Extra":""},{"Field":"type","Type":"varchar(255)","Null":"NO","Key":"","Default":"post","Extra":""},{"Field":"edit_datatime","Type":"datetime","Null":"NO","Key":"","Default":"0000-00-00 00:00:00","Extra":""}];
        return getPromise(data);
      }else if(sql === 'SHOW COLUMNS FROM `think_tag`'){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"name","Type":"varchar(255)","Null":"NO","Key":"UNI","Default":"","Extra":""},{"Field":"alias_name","Type":"varchar(255)","Null":"NO","Key":"","Default":"","Extra":""},{"Field":"desc","Type":"tinytext","Null":"YES","Key":"","Default":null,"Extra":""}]
        return getPromise(data)
      }else if(sql === 'SHOW COLUMNS FROM `think_cate`'){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"pid","Type":"int(11)","Null":"YES","Key":"","Default":"0","Extra":""},{"Field":"name","Type":"varchar(11)","Null":"NO","Key":"UNI","Default":"","Extra":""},{"Field":"alias_name","Type":"varchar(11)","Null":"YES","Key":"","Default":"","Extra":""},{"Field":"desc","Type":"tinytext","Null":"YES","Key":"","Default":null,"Extra":""}];
        return getPromise(data);
      }else if(sql === 'SHOW COLUMNS FROM `think_type1`'){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"post_id","Type":"int(11)","Null":"YES","Key":"","Default":"0","Extra":""},{"Field":"name","Type":"varchar(11)","Null":"NO","Key":"UNI","Default":"","Extra":""},{"Field":"alias_name","Type":"varchar(11)","Null":"YES","Key":"","Default":"","Extra":""},{"Field":"desc","Type":"tinytext","Null":"YES","Key":"","Default":null,"Extra":""}];
        return getPromise(data);
      }else if(sql === 'SHOW COLUMNS FROM `think_type3`'){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"post_id","Type":"int(11)","Null":"YES","Key":"","Default":"0","Extra":""},{"Field":"name","Type":"varchar(11)","Null":"NO","Key":"UNI","Default":"","Extra":""},{"Field":"alias_name","Type":"varchar(11)","Null":"YES","Key":"","Default":"","Extra":""},{"Field":"desc","Type":"tinytext","Null":"YES","Key":"","Default":null,"Extra":""}];
        return getPromise(data);
      }else if(sql === 'SHOW COLUMNS FROM `think_type4`'){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"post_id","Type":"int(11)","Null":"YES","Key":"","Default":"0","Extra":""},{"Field":"name","Type":"varchar(11)","Null":"NO","Key":"UNI","Default":"","Extra":""},{"Field":"alias_name","Type":"varchar(11)","Null":"YES","Key":"","Default":"","Extra":""},{"Field":"desc","Type":"tinytext","Null":"YES","Key":"","Default":null,"Extra":""}];
        return getPromise(data);
      }else if(sql === 'SHOW COLUMNS FROM `think_tag1`'){
        var data = [{"Field":"id","Type":"int(11) unsigned","Null":"NO","Key":"PRI","Default":null,"Extra":"auto_increment"},{"Field":"post_id","Type":"int(11)","Null":"YES","Key":"","Default":"0","Extra":""},{"Field":"name","Type":"varchar(11)","Null":"NO","Key":"UNI","Default":"","Extra":""},{"Field":"alias_name","Type":"varchar(11)","Null":"YES","Key":"","Default":"","Extra":""},{"Field":"desc","Type":"tinytext","Null":"YES","Key":"","Default":null,"Extra":""}];
        return getPromise(data);
      }else if(sql === "SELECT * FROM `think_type3` WHERE ( `post_id` = '1200' )"){
        var data = [{post_id: 1200, name: 'welefen'}, {post_id: 1200, name: 'suredy'}];
        return getPromise(data)
      }else if(sql === "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` IN ('1100','1101') ) AND a.tag_id=b.id  AND ( `name` = 'welefen' )"){
        var data = [{post_id: 1100, name: 'welefen'}, {post_id: 1101, name: 'suredy'}];
        return getPromise(data);
      }else if(sql === "SELECT * FROM `think_type1` WHERE ( `post_id` IN ('100','600') )"){
        var data = [{post_id: 100, name: 'welefen'}, {post_id: 600, name: 'suredy'}];
        return getPromise(data);
      }else if (sql === "INSERT INTO `think_type3` (`name`,`post_id`) VALUES('errorname',100)") {
        return getPromise([], true);
      }else if (sql === "SELECT `id` FROM `think_type4` WHERE ( `name` = 'welefen' ) LIMIT 1") {
        return getPromise([{id: 999}]);
      }else if (sql === "INSERT INTO `think_type4` (`name`) VALUES('4add')") {
        return getPromise({insertId: 976})
      }else if (sql === "SELECT `id` FROM `think_type4` WHERE ( `name` = 'hasids' ) LIMIT 1") {
        return getPromise([{id: 1234}]);
      };
      return getPromise([]);
    })
  })
});

describe('RelationModel', function(){
  it('setRelation', function(){
    var instance = RelationModel();
    instance.setRelation();
    assert.deepEqual(instance._relationName, {});
  })
  it('setRelation array', function(){
    var instance = RelationModel();
    instance.setRelation('cate,tag');
    assert.deepEqual(instance._relationName, ['cate', 'tag']);
  })
  it('setRelation(name, value)', function(){
    var instance = RelationModel();
    instance.setRelation('tag', true);
    assert.deepEqual(instance.relation, {tag: true});
  })
  it('setRelation({tag: true})', function(){
    var instance = RelationModel();
    instance.setRelation({tag: true});
    assert.deepEqual(instance.relation, {tag: true});
  })
  it('getRelation data empty', function(){
    var instance = RelationModel();
    var data = instance.getRelation();
    assert.equal(data, undefined)
  })
  it('getRelation data empty', function(){
    var instance = RelationModel();
    var data = instance.getRelation([]);
    assert.deepEqual(data, [])
  })
  it('getRelation relation empty', function(){
    var instance = RelationModel();
    var data = instance.getRelation(['welefen']);
    assert.deepEqual(data, ['welefen'])
  })
  it('getRelation relationName empty', function(){
    var instance = RelationModel();
    instance.setRelation({tag: true})
    instance._relationName = false;
    var data = instance.getRelation(['welefen']);
    assert.deepEqual(data, ['welefen'])
  })
  it('getRelation relationName empty', function(done){
    var instance = RelationModel();
    instance.setRelation({tag: true})
    instance._relationName = 'Tag';
    instance.getRelation(['welefen']).then(function(data){
      assert.deepEqual(data, ['welefen'])
      done();
    });
  })
  it('getRelation 1 relation', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type1: 1
    })
    instance.getTableFields().then(function(){
      instance.getRelation([{name: 'welefen', id: 100}]).then(function(data){
        var sql = instance.getLastSql().trim();
        assert.equal(sql, "SELECT * FROM `think_type1` WHERE ( `post_id` = '100' )")
        assert.deepEqual(data, [ { name: 'welefen', id: 100, Type1: {} } ]);
        done();
      })
    })
  })
  it('getRelation 1 relation', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type1: 1
    })
    instance.getTableFields().then(function(){
      instance.getRelation([{name: 'welefen', id: 100}, {name: 'welefen', id: 600}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(JSON.stringify(data))
        assert.equal(sql, "SELECT * FROM `think_type1` WHERE ( `post_id` IN ('100','600') )")
        assert.deepEqual(data, [{"name":"welefen","id":100,"Type1":{"post_id":100,"name":"welefen"}},{"name":"welefen","id":600,"Type1":{"post_id":600,"name":"suredy"}}]);
        done();
      })
    })
  })
  it('getRelation 1 relation, find', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type1: 1
    })
    instance.getTableFields().then(function(){
      instance.getRelation({name: 'welefen', id: 100}).then(function(data){
        var sql = instance.getLastSql().trim();
        assert.equal(sql, "SELECT * FROM `think_type1` WHERE ( `post_id` = 100 )")
        assert.deepEqual(data, { name: 'welefen', id: 100, Type1: {} });
        done();
      })
    })
  })
  it('getRelation 2 relation', function(done){
    var instance = RelationModel('Type1');
    instance.setRelation({
      Post: 2
    })
    instance.getTableFields().then(function(){
      instance.getRelation([{name: 'welefen', post_id: 200}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_post` WHERE ( `id` = '200' )")
        //console.log(data)
        assert.deepEqual(data, [ { name: 'welefen', post_id: 200, Post: {} } ]);
        done();
      })
    })
  })
  it('getRelation 3 relation', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: 3
    })
    instance.getTableFields().then(function(){
      instance.getRelation([{name: 'welefen', id: 200}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_type3` WHERE ( `post_id` = '200' )")
        //console.log(data)
        assert.deepEqual(data, [ { name: 'welefen', id: 200, Type3: [] } ]);
        done();
      })
    })
  })
  it('getRelation 3 relation', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: 3
    })
    instance.getTableFields().then(function(){
      instance.getRelation([{name: 'welefen', id: 1200}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT * FROM `think_type3` WHERE ( `post_id` = '1200' )")
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, [{"name":"welefen","id":1200,"Type3":[{"post_id":1200,"name":"welefen"},{"post_id":1200,"name":"suredy"}]}]);
        done();
      })
    })
  })
  it('getRelation 4relation', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: 4
    })
    instance.getTableFields().then(function(){
      instance.getRelation([{name: 'welefen', id: 100}]).then(function(data){
        var sql = instance.getLastSql().trim();
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` = '100' ) AND a.tag_id=b.id")
        assert.deepEqual(data, [ { name: 'welefen', id: 100, Tag: [] } ]);
        done();
      })
    })
  })
  it('getRelation 4 relation', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 4}
    })
    instance.getTableFields().then(function(){
      instance.getRelation([{name: 'welefen', id: 100}]).then(function(data){
        var sql = instance.getLastSql().trim();
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` = '100' ) AND a.tag_id=b.id")
        assert.deepEqual(data, [ { name: 'welefen', id: 100, Tag: [] } ]);
        done();
      })
    })
  })
  it('getRelation 4 data empty', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 4, where: '1=1'}
    })
    getPromise(instance.getTableFields()).then(function(){
      instance.getRelation([{name: 'welefen', 'id': 100}]).then(function(data){
        var sql = instance.getLastSql().trim();
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` = '100' ) AND a.tag_id=b.id  AND 1=1")
        assert.deepEqual(data, [ { name: 'welefen', id: 100, Tag: [] } ]);
        done();
      })
    })
  })
  it('getRelation 4 data empty1', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 4, where: {name: 'welefen'}}
    })
    getPromise(instance.getTableFields()).then(function(){
      instance.getRelation([{name: 'welefen', 'id': 100}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` = '100' ) AND a.tag_id=b.id  AND ( `name` = 'welefen' )")
        assert.deepEqual(data, [ { name: 'welefen', id: 100, Tag: [] } ]);
        done();
      })
    })
  })
  it('getRelation 4 multi data', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 4, where: {name: 'welefen'}}
    })
    getPromise(instance.getTableFields()).then(function(){
      instance.getRelation([{name: 'welefen', 'id': 100}, {name: 'welefen', 'id': 101}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        //console.log(data)
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` IN ('100','101') ) AND a.tag_id=b.id  AND ( `name` = 'welefen' )")
        assert.deepEqual(data, [ { name: 'welefen', id: 100, Tag: [] },{ name: 'welefen', id: 101, Tag: [] } ]);
        done();
      })
    })
  })
  it('getRelation 4 multi data 1', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 4, where: {name: 'welefen'}}
    })
    getPromise(instance.getTableFields()).then(function(){
      instance.getRelation([{name: 'welefen', 'id': 1100}, {name: 'welefen', 'id': 1101}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        //console.log(JSON.stringify(data))
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` IN ('1100','1101') ) AND a.tag_id=b.id  AND ( `name` = 'welefen' )")
        assert.deepEqual(data, [{"name":"welefen","id":1100,"Tag":[{"post_id":1100,"name":"welefen"}]},{"name":"welefen","id":1101,"Tag":[{"post_id":1101,"name":"suredy"}]}]);
        done();
      })
    })
  })
  it('_afterFind', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 4, where: {name: 'welefen'}}
    })
    getPromise(instance.getTableFields()).then(function(){
      instance._afterFind({name: 'welefen', 'id': 100}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(data)
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` = 100 ) AND a.tag_id=b.id  AND ( `name` = 'welefen' )")
        assert.deepEqual(data, { name: 'welefen', id: 100, Tag: [] });
        done();
      })
    })
  })
  it('_afterSelect', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 4, where: {name: 'welefen'}}
    })
    getPromise(instance.getTableFields()).then(function(){
      instance._afterSelect([{name: 'welefen', 'id': 100}]).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "SELECT b.*, a.post_id FROM think_post_tag as a, think_tag as b  WHERE ( `post_id` = '100' ) AND a.tag_id=b.id  AND ( `name` = 'welefen' )")
        assert.deepEqual(data, [ { name: 'welefen', id: 100, Tag: [] } ]);
        done();
      })
    })
  })


it('postRelation data empty', function(){
    var instance = RelationModel();
    var data = instance.postRelation();
    assert.equal(data, undefined)
  })
  it('postRelation data empty', function(){
    var instance = RelationModel();
    var data = instance.postRelation('ADD', []);
    assert.deepEqual(data, [])
  })
  it('postRelation relation empty', function(){
    var instance = RelationModel();
    var data = instance.postRelation('ADD', ['welefen']);
    assert.deepEqual(data, ['welefen'])
  })
  it('postRelation relationName empty', function(){
    var instance = RelationModel();
    instance.postRelation({tag: true})
    instance._relationName = false;
    var data = instance.postRelation('ADD', ['welefen']);
    assert.deepEqual(data, ['welefen'])
  })
  it('postRelation relationName empty', function(done){
    var instance = RelationModel();
    instance.setRelation({tag: true})
    instance._relationName = 'Tag';
    instance.postRelation('ADD', ['welefen']).then(function(data){
      assert.deepEqual(data, ['welefen'])
      done();
    });
  })
  it('postRelation 1 ADD', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: 1
    })
    instance.getTableFields().then(function(){
      return instance.postRelation('ADD', {name: 'welefen'}).then(function(data){
        var sql = instance.getLastSql().trim();
        //assert.equal(sql, "SHOW COLUMNS FROM `think_adv`")
        assert.deepEqual(data, { name: 'welefen' });
        done();
      })
    })
  })
  it('postRelation 1 ADD', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 1}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen'}).then(function(data){
        var sql = instance.getLastSql().trim();
        //assert.equal(sql, "SHOW COLUMNS FROM `think_adv`")
        assert.deepEqual(data, { name: 'welefen' });
        done();
      })
    })
  })
  it('postRelation 1 ADD', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag: {type: 1}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', Tag: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //assert.equal(sql, "SHOW COLUMNS FROM `think_adv`");
        //console.log(data)
        assert.deepEqual(data, { name: 'welefen', Tag: { name: 'welefen' } });
        done();
      })
    })
  })
  it('postRelation 1 ADD', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag1: {type: 1}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Tag1: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_tag1` (`name`,`post_id`) VALUES('welefen',100)");
        //console.log(data)
        assert.deepEqual(data, { name: 'welefen',id: 100,Tag1: { name: 'welefen', post_id: 100 } });
        done();
      })
    })
  })
  it('postRelation 1 DELETE', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag1: {type: 1}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('DELETE', {name: 'welefen', id: 100, Tag1: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "DELETE FROM `think_tag1` WHERE ( `post_id` = 100 )");
        //console.log(data)
        assert.deepEqual(data, { name: 'welefen', id: 100, Tag1: { name: 'welefen' } });
        done();
      })
    })
  })
  it('postRelation 1 UPDATE', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag1: {type: 1}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('UPDATE', {name: 'welefen', id: 100, Tag1: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "UPDATE `think_tag1` SET `name`='welefen' WHERE ( `post_id` = 100 )");
        //console.log(data)
        assert.deepEqual(data, { name: 'welefen', id: 100, Tag1: { name: 'welefen' } });
        done();
      })
    })
  })
  it('postRelation 2 UPDATE', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Tag1: {type: 2}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('UPDATE', {name: 'welefen', id: 100, Tag1: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        assert.deepEqual(data, { name: 'welefen', id: 100, Tag1: { name: 'welefen' } });
        done();
      })
    })
  })

  it('postRelation 3 ADD', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: {type: 3}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type3: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_type3`(`name`,`post_id`) VALUES ('welefen',100)");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type3":{"name":"welefen","post_id":100}});
        done();
      })
    })
  })
  it('postRelation 3 ADD multi data', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: {type: 3}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type3: [{name: 'welefen'}, {name: 'suredy'}]}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_type3`(`name`,`post_id`) VALUES ('welefen',100),('suredy',100)");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type3":[{"name":"welefen","post_id":100},{"name":"suredy","post_id":100}]});
        done();
      })
    })
  })
  it('postRelation 3 UPDATE', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: {type: 3}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('UPDATE', {name: 'welefen', id: 100, Type3: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_type3` (`name`,`post_id`) VALUES('welefen',100)");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type3":{"name":"welefen","post_id":100}});
        done();
      })
    })
  })
  it('postRelation 3 UPDATE, with key', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: {type: 3}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('UPDATE', {name: 'welefen', id: 100, Type3: {name: 'welefen', id: 1001}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "UPDATE `think_type3` SET `name`='welefen' WHERE ( `id` = 1001 )");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type3":{"name":"welefen","id":1001}});
        done();
      })
    })
  })
  it('postRelation 3 UPDATE, add error', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: {type: 3}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('UPDATE', {name: 'welefen', id: 100, Type3: {name: 'errorname'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_type3` (`name`,`post_id`) VALUES('errorname',100)");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type3":{"name":"errorname","post_id":100}});
        done();
      })
    })
  })
  it('postRelation 3 DELETE', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type3: {type: 3}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('DELETE', {name: 'welefen', id: 100, Type3: {name: 'welefen'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "DELETE FROM `think_type3` WHERE ( `post_id` = 100 )");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type3":{"name":"welefen"}});
        done();
      })
    })
  })

  it('postRelation 4 ADD', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type4: {name: '4add'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,976)");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":{"name":"4add"}});
        done();
      }).catch(function(err){
      console.log(err.stack);
      done();
    })
    }).catch(function(err){
      console.log(err.stack);
      done();
    })
  })
  it('postRelation 4 ADD, number', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type4: 50}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,50)");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":50});
        done();
      })
    })
  })
  it('postRelation 4 ADD, numberstring', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type4: '50'}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,'50')");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":'50'});
        done();
      })
    })
  })
  it('postRelation 4 ADD, numberstring', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type4: ['50']}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,'50')");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":['50']});
        done();
      })
    })
  })
  it('_afterAdd, numberstring', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      instance._afterAdd({name: 'welefen', id: 100, Type4: ['50']}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,'50')");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":['50']});
        done();
      })
    })
  })
  it('postRelation 4 ADD, string', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type4: ['string']}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,976)");
        //console.log(JSON.stringify(data))
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":["string"]});
        done();
      })
    })
  })
  it('postRelation 4 ADD, no unique field', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      var getUniqueField = thinkRequire('Model').prototype.getUniqueField;
      thinkRequire('Model').prototype.getUniqueField = function(){};
      instance.postRelation('ADD', {name: 'welefen', id: 100, Type4: {name: 'welefen'}}).catch(function(err){
        assert.equal(err.message, "table `think_type4` has no unqiue field");
        thinkRequire('Model').prototype.getUniqueField = getUniqueField;
        done();
      })
    })
  })
  it('postRelation 4 ADD, has ids', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      return instance.postRelation('ADD', {name: 'welefen', id: 100, Type4: {name: 'hasids'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        //console.log(JSON.stringify(data))
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,1234)");
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":{"name":"hasids"}});
        done();
      })
    })
  })
  it('postRelation 4 UPDATE', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      return instance.postRelation('UPDATE', {name: 'welefen', id: 100, Type4: {name: 'hasids'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        //console.log(JSON.stringify(data))
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,1234)");
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":{"name":"hasids"}});
        done();
      })
    })
  })
  it('_afterUpdate', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      return instance._afterUpdate({name: 'welefen', id: 100, Type4: {name: 'hasids'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        //console.log(JSON.stringify(data))
        assert.equal(sql, "INSERT INTO `think_post_type4`(`post_id`,`type4_id`) VALUES (100,1234)");
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":{"name":"hasids"}});
        done();
      })
    })
  })
  it('postRelation 4 DELETE', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      return instance.postRelation('DELETE', {name: 'welefen', id: 100, Type4: {name: 'hasids'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        //console.log(JSON.stringify(data))
        assert.equal(sql, "DELETE FROM `think_post_type4` WHERE ( `post_id` = 100 )");
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":{"name":"hasids"}});
        done();
      })
    })
  })
  it('_afterDelete', function(done){
    var instance = RelationModel('Post');
    instance.setRelation({
      Type4: {type: 4}
    })
    instance.getTableFields().then(function(){
      return instance._afterDelete({name: 'welefen', id: 100, Type4: {name: 'hasids'}}).then(function(data){
        var sql = instance.getLastSql().trim();
        //console.log(sql)
        //console.log(JSON.stringify(data))
        assert.equal(sql, "DELETE FROM `think_post_type4` WHERE ( `post_id` = 100 )");
        assert.deepEqual(data, {"name":"welefen","id":100,"Type4":{"name":"hasids"}});
        done();
      })
    })
  })
})

describe('after', function(){
  it('after', function(){
    muk.restore();
  })
})