'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var Parse = require('../../../lib/adapter/db/_parse.js');

describe('adapter/db/_parse.js', function(){
  it('init', function(){
    var instance = new Parse();
    var keys = Object.keys(instance.comparison).sort();
    assert.deepEqual(keys, [ '<>','EGT','ELT','EQ','GT','IN','LIKE','LT','NEQ','NOTIN','NOTLIKE' ])
  })
  it('parseSet', function(){
    var instance = new Parse();
    var data = instance.parseSet({
      name: 'welefen'
    })
    assert.equal(data, " SET name='welefen'");
  })
  it('parseSet, has extra value', function(){
    var instance = new Parse();
    var data = instance.parseSet({
      name: 'welefen',
      value: ['array']
    })
    assert.equal(data, " SET name='welefen'");
  })
  it('parseSet, empty', function(){
    var instance = new Parse();
    var data = instance.parseSet()
    assert.equal(data, "");
  })
  it('parseKey is function', function(){
    var instance = new Parse();
    var key = instance.parseKey('key');
    assert.equal(key, 'key')
  })
  it('parseValue, string', function(){
    var instance = new Parse();
    var key = instance.parseValue('key');
    assert.equal(key, "'key'")
  })
  it('parseValue, array, exp', function(){
    var instance = new Parse();
    var key = instance.parseValue(['exp', 'welefen']);
    assert.equal(key, "welefen")
  })
  it('parseValue, null', function(){
    var instance = new Parse();
    var key = instance.parseValue(null);
    assert.equal(key, "null")
  })
  it('parseValue, boolean, true', function(){
    var instance = new Parse();
    var key = instance.parseValue(true);
    assert.equal(key, "1")
  })
  it('parseValue, boolean, false', function(){
    var instance = new Parse();
    var key = instance.parseValue(false);
    assert.equal(key, "0")
  })
  it('parseValue, object', function(){
    var instance = new Parse();
    var key = instance.parseValue({});
    assert.deepEqual(key, {})
  })
  it('parseField, empty', function(){
    var instance = new Parse();
    var key = instance.parseField();
    assert.deepEqual(key, '*')
  })
  it('parseField, single field', function(){
    var instance = new Parse();
    var key = instance.parseField('name');
    assert.deepEqual(key, 'name')
  })
  it('parseField, multi field', function(){
    var instance = new Parse();
    var key = instance.parseField('name,title');
    assert.deepEqual(key, 'name,title')
  })
  it('parseField, multi field', function(){
    var instance = new Parse();
    var key = instance.parseField('name, title');
    assert.deepEqual(key, 'name,title')
  })
  it('parseField, object', function(){
    var instance = new Parse();
    var key = instance.parseField({
      name: 'name',
      title1: 'title'
    });
    assert.deepEqual(key, 'name AS name,title1 AS title')
  })
  it('parseTable, empty', function(){
    var instance = new Parse();
    var key = instance.parseTable();
    assert.deepEqual(key, '')
  })
  it('parseTable, string', function(){
    var instance = new Parse();
    var key = instance.parseTable('user');
    assert.deepEqual(key, 'user')
  })
  it('parseTable, string, multi', function(){
    var instance = new Parse();
    var key = instance.parseTable('user, group');
    assert.deepEqual(key, 'user,group')
  })
  it('parseTable, object', function(){
    var instance = new Parse();
    var key = instance.parseTable({
      user: 'user1',
      group: 'group1'
    });
    assert.deepEqual(key, 'user AS user1,group AS group1')
  })
  it('getLogic', function(){
    var instance = new Parse();
    var key = instance.getLogic({});
    assert.deepEqual(key, 'AND')
  })
  it('getLogic, has _logic', function(){
    var instance = new Parse();
    var key = instance.getLogic({
      _logic: 'OR'
    });
    assert.deepEqual(key, 'OR')
  })
  it('getLogic, has _logic, error', function(){
    var instance = new Parse();
    var key = instance.getLogic({
      _logic: 'test'
    });
    assert.deepEqual(key, 'AND')
  })
  it('getLogic, default is OR', function(){
    var instance = new Parse();
    var key = instance.getLogic({}, 'OR');
    assert.deepEqual(key, 'OR')
  })
  it('getLogic, string', function(){
    var instance = new Parse();
    var key = instance.getLogic('AND', 'OR');
    assert.deepEqual(key, 'AND')
  })
  it('getLogic, string, lowercase', function(){
    var instance = new Parse();
    var key = instance.getLogic('and', 'OR');
    assert.deepEqual(key, 'AND')
  })
  it('escapeString is function', function(){
    var instance = new Parse();
    assert.equal(think.isFunction(instance.escapeString), true);
  })
  it('parseLock, empty', function(){
    var instance = new Parse();
    var data = instance.parseLock();
    assert.equal(data, '');
  })
  it('parseLock, true', function(){
    var instance = new Parse();
    var data = instance.parseLock(true);
    assert.equal(data, ' FOR UPDATE ');
  })
  it('parseDistinct, empty', function(){
    var instance = new Parse();
    var data = instance.parseDistinct();
    assert.equal(data, '');
  })
  it('parseDistinct, true', function(){
    var instance = new Parse();
    var data = instance.parseDistinct(true);
    assert.equal(data, ' Distinct ');
  })
  it('parseComment, empty', function(){
    var instance = new Parse();
    var data = instance.parseComment();
    assert.equal(data, '');
  })
  it('parseComment, welefen test', function(){
    var instance = new Parse();
    var data = instance.parseComment('welefen test');
    assert.equal(data, ' /*welefen test*/ ');
  })
  it('parseHaving, empty', function(){
    var instance = new Parse();
    var data = instance.parseHaving();
    assert.equal(data, '');
  })
  it('parseHaving, SUM(area)>1000000', function(){
    var instance = new Parse();
    var data = instance.parseHaving('SUM(area)>1000000');
    assert.equal(data, ' HAVING SUM(area)>1000000');
  })
  it('parseGroup, empty', function(){
    var instance = new Parse();
    var data = instance.parseGroup();
    assert.equal(data, '');
  })
  it('parseGroup, name', function(){
    var instance = new Parse();
    var data = instance.parseGroup('name');
    assert.equal(data, ' GROUP BY `name`');
  })
  it('parseGroup, name,title', function(){
    var instance = new Parse();
    var data = instance.parseGroup('name, title');
    assert.equal(data, ' GROUP BY `name`,`title`');
  })
  it('parseGroup, user.name,title', function(){
    var instance = new Parse();
    var data = instance.parseGroup(['user.name', 'title']);
    assert.equal(data, ' GROUP BY user.`name`,`title`');
  })
  it('parseOrder, empty', function(){
    var instance = new Parse();
    var data = instance.parseOrder();
    assert.equal(data, '');
  })
  it('parseOrder, array', function(){
    var instance = new Parse();
    var data = instance.parseOrder(['name ASC', 'title DESC']);
    assert.equal(data, ' ORDER BY name ASC,title DESC');
  })
  it('parseOrder, string', function(){
    var instance = new Parse();
    var data = instance.parseOrder('name ASC,title DESC');
    assert.equal(data, ' ORDER BY name ASC,title DESC');
  })
  it('parseOrder, object', function(){
    var instance = new Parse();
    var data = instance.parseOrder({name: 'ASC', 'title': 'DESC'});
    assert.equal(data, ' ORDER BY name ASC,title DESC');
  })
  it('parseLimit, empty', function(){
    var instance = new Parse();
    var data = instance.parseLimit();
    assert.equal(data, '');
  })
  it('parseLimit, 10', function(){
    var instance = new Parse();
    var data = instance.parseLimit('10');
    assert.equal(data, ' LIMIT 10');
  })
  it('parseLimit, 10, 20', function(){
    var instance = new Parse();
    var data = instance.parseLimit('10, 20');
    assert.equal(data, ' LIMIT 10,20');
  })
  it('parseLimit, 10, welefen', function(){
    var instance = new Parse();
    var data = instance.parseLimit('10, welefen');
    assert.equal(data, ' LIMIT 10,0');
  })
  it('parseLimit, [20, 10]', function(){
    var instance = new Parse();
    var data = instance.parseLimit([20, 10]);
    assert.equal(data, ' LIMIT 20,10');
  })
  it('parseJoin, empty', function(){
    var instance = new Parse();
    var data = instance.parseJoin();
    assert.equal(data, '');
  })
  it('parseJoin, single string', function(){
    var instance = new Parse();
    var data = instance.parseJoin('meinv_cate ON meinv_group.cate_id=meinv_cate.id');
    assert.equal(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id');
  })
  it('parseJoin, multi string', function(){
    var instance = new Parse();
    var data = instance.parseJoin(['meinv_cate ON meinv_group.cate_id=meinv_cate.id', 'RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id']);
    assert.equal(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id');
  })
  it('parseJoin, array', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
      table: 'cate', 
      join: 'inner', 
      as: 'c',
      on: ['cate_id', 'id'] 
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' INNER JOIN `cate` AS c ON user.`cate_id`=c.`id`');
  })
  it('parseJoin, array, no on', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
      table: 'cate', 
      join: 'inner', 
      as: 'c'
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' INNER JOIN `cate` AS c');
  })
  it('parseJoin, array, ignore not object', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
      table: 'cate', 
      join: 'inner', 
      as: 'c'
    }, true], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' INNER JOIN `cate` AS c');
  })
  it('parseJoin, array, multi', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
      table: 'cate',
      join: 'left',
      as: 'c',
      on: ['cate_id', 'id']
    }, {
      table: 'group_tag',
      join: 'left',
      as: 'd',
      on: ['id', 'group_id']
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN `cate` AS c ON user.`cate_id`=c.`id` LEFT JOIN `group_tag` AS d ON user.`id`=d.`group_id`');
  })
  it('parseJoin, array, multi 1', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
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
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN `cate` AS c ON user.`id`=c.`id` LEFT JOIN `group_tag` AS d ON user.`id`=d.`group_id`');
  })
  it('parseJoin, array, multi 2', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
      cate: {
        on: ['id', 'id']
      },
      group_tag: {
        on: ['id', 'group_id']
      }
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN `cate` ON user.`id`=cate.`id` LEFT JOIN `group_tag` ON user.`id`=group_tag.`group_id`');
  })
  it('parseJoin, array, multi 3', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
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
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN `cate` ON user.`id`=cate.`id` LEFT JOIN `group_tag` ON user.`id`=group_tag.`group_id` LEFT JOIN `tag` ON (user.`id`=tag.`id` AND user.`title`=tag.`name`)');
  })
  it('parseJoin, array, multi 4, on has table name', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
      cate: {
        on: 'id, id'
      },
      group_tag: {
        on: ['id', 'group_id']
      },
      tag: {
        on: { 
          id: 'id',
          title: 'tag.name'
        }
      }
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN `cate` ON user.`id`=cate.`id` LEFT JOIN `group_tag` ON user.`id`=group_tag.`group_id` LEFT JOIN `tag` ON (user.`id`=tag.`id` AND user.`title`=tag.name)');
  })
  it('parseJoin, array, multi 4', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
      cate: {
        on: 'id, id'
      },
      group_tag: {
        on: ['id', 'group_id']
      },
      tag: {
        on: { 
          id: 'id',
          'u1.title': 'tag.name'
        }
      }
    }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN `cate` ON user.`id`=cate.`id` LEFT JOIN `group_tag` ON user.`id`=group_tag.`group_id` LEFT JOIN `tag` ON (user.`id`=tag.`id` AND u1.title=tag.name)');
  })
  it('parseJoin, array, table is sql', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
        table: 'SELECT * FROM test WHERE 1=1',
        join: 'left',
        as: 'temp',
        on: ['id', 'temp.team_id']
      }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS temp ON user.`id`=temp.team_id');
  })
  it('parseJoin, array, table is sql 1', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
        table: 'SELECT * FROM test WHERE 1=1',
        join: 'left',
        as: 'temp',
        on: ['u.id', 'temp.team_id']
      }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS temp ON u.id=temp.team_id');
  })
  it('parseJoin, array, table is sql 2', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
        table: 'SELECT * FROM test WHERE 1=1',
        join: 'left',
        as: 'temp',
        on: ['id', 'team_id']
      }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS temp ON user.`id`=temp.`team_id`');
  })
  it('parseJoin, array, table is sql 3', function(){
    var instance = new Parse();
    var data = instance.parseJoin([{
        table: '(SELECT * FROM test WHERE 1=1)',
        join: 'left',
        as: 'temp',
        on: ['id', 'team_id']
      }], {
      tablePrefix: '',
      table: 'user'
    });
    assert.equal(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS temp ON user.`id`=temp.`team_id`');
  })
})