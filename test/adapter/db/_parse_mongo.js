'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var Parse = require('../../../lib/adapter/db/_parse_mongo.js');

describe('adapter/db/_parse_mongo', function(){
  it('init', function(){
    var instance = new Parse();
    var keys = Object.keys(instance.comparison).sort();
    assert.deepEqual(keys, ["!=","<","<=","<>","=",">",">=","EGT","ELT","EQ","GT","IN","LT","NEQ","NOTIN"]);
  })
  it('parseField, empty', function(){
    var instance = new Parse();
    var data = instance.parseField();
    assert.deepEqual(data, {})
  })
  it('parseField, string', function(){
    var instance = new Parse();
    var data = instance.parseField('name, title');
    assert.deepEqual(data, {name: 1, title: 1})
  })
  it('parseField, string, reverse', function(){
    var instance = new Parse();
    var data = instance.parseField('name, title', true);
    assert.deepEqual(data, {name: 0, title: 0})
  })
  it('parseField, object', function(){
    var instance = new Parse();
    var data = instance.parseField({name: 1, title: 1});
    assert.deepEqual(data, {name: 1, title: 1})
  })
  it('parseField, object, reverse', function(){
    var instance = new Parse();
    var data = instance.parseField({name: 1, title: 1}, true);
    assert.deepEqual(data, {name: 0, title: 0})
  })
  it('parseLimit, empty', function(){
    var instance = new Parse();
    var data = instance.parseLimit();
    assert.deepEqual(data, [])
  })
  it('parseLimit, number', function(){
    var instance = new Parse();
    var data = instance.parseLimit(10);
    assert.deepEqual(data, [0, 10])
  })
  it('parseLimit, string', function(){
    var instance = new Parse();
    var data = instance.parseLimit('10');
    assert.deepEqual(data, [0, 10])
  })
  it('parseLimit, string, skip', function(){
    var instance = new Parse();
    var data = instance.parseLimit('10, 20');
    assert.deepEqual(data, [10, 20])
  })
  it('parseOrder, empty', function(){
    var instance = new Parse();
    var data = instance.parseOrder();
    assert.deepEqual(data, {})
  })
  it('parseOrder, natural', function(){
    var instance = new Parse();
    var data = instance.parseOrder(true);
    assert.deepEqual(data, {$natural: true})
  })
  it('parseOrder, natural 1', function(){
    var instance = new Parse();
    var data = instance.parseOrder('natural');
    assert.deepEqual(data, {$natural: true})
  })
  it('parseOrder, string', function(){
    var instance = new Parse();
    var data = instance.parseOrder('name');
    assert.deepEqual(data, {name: 1})
  })
  it('parseOrder, string, 2', function(){
    var instance = new Parse();
    var data = instance.parseOrder('name,title');
    assert.deepEqual(data, {name: 1, title: 1})
  })
  it('parseOrder, string, 3', function(){
    var instance = new Parse();
    var data = instance.parseOrder('name,title desc');
    assert.deepEqual(data, {name: 1, title: -1})
  })
  it('parseOrder, object', function(){
    var instance = new Parse();
    var data = instance.parseOrder({
      name: 1,
      title: false
    });
    assert.deepEqual(data, {name: 1, title: -1})
  })
   it('parseOrder, object 1', function(){
    var instance = new Parse();
    var data = instance.parseOrder({
      name: 0,
      title: -1
    });
    assert.deepEqual(data, {name: -1, title: -1})
  })
  it('parseGroup, empty', function(){
    var instance = new Parse();
    var data = instance.parseGroup();
    assert.deepEqual(data, '')
  })
  it('parseGroup, string', function(){
    var instance = new Parse();
    var data = instance.parseGroup('name, title');
    assert.deepEqual(data, ['name', 'title'])
  })
  it('parseGroup, array', function(){
    var instance = new Parse();
    var data = instance.parseGroup(['name', 'title']);
    assert.deepEqual(data, ['name', 'title'])
  })
  it('parseWhere, empty', function(){
    var instance = new Parse();
    var data = instance.parseWhere();
    assert.deepEqual(data, {})
  })
  it('parseDistinct, empty', function(){
    var instance = new Parse();
    var data = instance.parseDistinct();
    assert.deepEqual(data, undefined)
  })
})