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
})