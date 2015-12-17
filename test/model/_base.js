'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


// for(var filepath in require.cache){
//   delete require.cache[filepath];
// }
var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var Base;

describe('model/_base.js', function(){
  it('before', function(){
    Base = require('../../lib/model/_base.js');
  })
  it('get instance', function(){
    var instance = new Base('user');
    assert.deepEqual(instance.config, {});
    assert.deepEqual(instance.name, 'user')
  })
  it('get instance, config contains tableprefix', function(){
    var instance = new Base('user', {
      prefix: 'think_'
    });
    assert.deepEqual(instance.config, {
      prefix: 'think_'
    });
    assert.deepEqual(instance.name, 'user');
    assert.deepEqual(instance.tablePrefix, 'think_')
  })
  it('get instance, name is object', function(){
    var instance = new Base({
      prefix: 'think_'
    });
    assert.deepEqual(instance.config, {
      prefix: 'think_'
    });
    assert.deepEqual(instance.name, '');
    assert.deepEqual(instance.tablePrefix, 'think_')
  })
  it('get instance, name is object', function(){
    var instance = new Base('user', think.config('db'));
    var model = instance.model('base');
    assert.deepEqual(think.isObject(model), true);
  })
  it('get db instance', function(){
    var instance = new Base('user', think.config('db'));
    var db = instance.db();
    assert.deepEqual(think.isObject(db), true);
  })
  it('get db instance, exist', function(){
    var instance = new Base('user', think.config('db'));
    instance._db = true
    var db = instance.db();
    assert.deepEqual(db, true);
  })
  it('get db instance 1', function(){
    var instance = new Base('user', think.config('db'));
    var db = instance.db();
    var db1 = instance.db();
    assert.deepEqual(db, db1);
  })
  it('getModelName', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.getModelName();
    assert.equal(data, 'user')
  })
  it('getModelName, from filename', function(){
    var instance = new Base('', think.config('db'));
    var data = instance.getModelName();
    assert.equal(data, 'base')
  })
  it('getTableName', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.getTableName();
    assert.equal(data, 'think_user')
  })
  it('getTableName, has table name', function(){
    var instance = new Base('user', think.config('db'));
    instance.tableName = 'test'
    var data = instance.getTableName();
    assert.equal(data, 'think_test')
  })
  it('cache, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.cache();
    assert.equal(data, instance);
  })
  it('cache, with key', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.cache('welefen');
    assert.deepEqual(instance._options.cache, { on: true, type: '', timeout: 3600, key: 'welefen' });
  })
  it('cache, with key, has timeout', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.cache('welefen', 3000);
    assert.deepEqual(instance._options.cache, { on: true, type: '', timeout: 3000, key: 'welefen' })
  })
  it('cache, no key, has timeout', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.cache(3000);
    assert.deepEqual(instance._options.cache, { on: true, type: '', timeout: 3000, key: '' })
  })
  it('cache, key is object', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.cache({key: 'suredy', timeout: 4000});
    assert.deepEqual(instance._options.cache, {key: 'suredy', timeout: 4000})
  })
  it('limit, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.limit();
    assert.equal(data, instance);
  })
  it('limit, with limit', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.limit(100);
    assert.deepEqual(instance._options.limit, [100, undefined]);
  })
  it('limit, with limit, offset', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.limit(100, 30);
    assert.deepEqual(instance._options.limit, [100, 30]);
  })
  it('page, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.page();
    assert.equal(data, instance);
  })
  it('page, with page', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.page(3);
    assert.deepEqual(instance._options.limit, [20, 10]);
  })
  it('page, with page, offset', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.page(3, 30);
    assert.deepEqual(instance._options.limit, [60, 30]);
  })
  it('where, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.where();
    assert.equal(data, instance);
  })
  it('where, string', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.where('id=1');
    assert.deepEqual(instance._options.where, {_string: 'id=1'})
  })
  it('where, object', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.where({name: 'welefen'});
    assert.deepEqual(instance._options.where, {name: 'welefen'})
  })
  it('where, mix', function(){
    var instance = new Base('user', think.config('db'));
    instance.where('id=100')
    var data = instance.where({name: 'welefen'});
    assert.deepEqual(instance._options.where, {_string: 'id=100', name: 'welefen'})
  })
  it('field, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.field();
    assert.equal(data, instance);
  })
  it('field, string', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.field('name,title');
    assert.deepEqual(instance._options.field, ['name', 'title'])
    assert.deepEqual(instance._options.fieldReverse, false);
  })
  it('field, array', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.field(['name', 'title']);
    assert.deepEqual(instance._options.field, ['name', 'title'])
    assert.deepEqual(instance._options.fieldReverse, false);
  })
  it('field, string, reverse', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.field('name,title', true);
    assert.deepEqual(instance._options.field, ['name', 'title'])
    assert.deepEqual(instance._options.fieldReverse, true);
  })
  it('fieldReverse, string,', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.fieldReverse('name,title');
    assert.deepEqual(instance._options.field, ['name', 'title'])
    assert.deepEqual(instance._options.fieldReverse, true);
  })
  it('table, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.table();
    assert.equal(data, instance);
  })
  it('table', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.table('user');
    assert.equal(instance._options.table, 'think_user');
  })
  it('table, has prefix', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.table('user', true);
    assert.equal(instance._options.table, 'user');
  })
  it('table, is select sql', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.table('SELECT * FROM test');
    assert.equal(instance._options.table, 'SELECT * FROM test');
  })
  it('union, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.union();
    assert.equal(data, instance);
  })
  it('union', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.union('SELECT * FROM test');
    assert.deepEqual(instance._options.union, [{
      union: 'SELECT * FROM test',
      all: false
    }]);
  })
  it('union all', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.union('SELECT * FROM test', true);
    assert.deepEqual(instance._options.union, [{
      union: 'SELECT * FROM test',
      all: true
    }]);
  })
  it('union multi', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.union('SELECT * FROM test1');
    var data = instance.union('SELECT * FROM test', true);
    assert.deepEqual(instance._options.union, [{
      union: 'SELECT * FROM test1',
      all: false
    }, {
      union: 'SELECT * FROM test',
      all: true
    }]);
  })
  it('join, return this', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.join();
    assert.equal(data, instance);
  })
  it('join string', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.join('left join test on test.id=user.id');
    assert.deepEqual(instance._options.join, ['left join test on test.id=user.id']);
  })
  it('join array', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.join(['left join test on test.id=user.id']);
    assert.deepEqual(instance._options.join, ['left join test on test.id=user.id']);
  })
  it('join multi', function(){
    var instance = new Base('user', think.config('db'));
    instance.join({
      table: 'test1'
    });
    var data = instance.join(['left join test on test.id=user.id']);
    assert.deepEqual(instance._options.join, [{table: 'test1'}, 'left join test on test.id=user.id']);
  })
  it('order', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.order('name desc');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.order, 'name desc')
  })
  it('alias', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.alias('a');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.alias, 'a')
  })
  it('having', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.having('a');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.having, 'a')
  })
  it('group', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.group('a');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.group, 'a')
  })
  it('lock', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.lock('a');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.lock, 'a')
  })
  it('auto', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.auto('a');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.auto, 'a')
  })
  it('filter', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.filter('a');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.filter, 'a')
  })
  it('distinct, true', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.distinct(true);
    assert.equal(data, instance);
    assert.deepEqual(instance._options.distinct, true)
  })
  it('distinct, field', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.distinct('name');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.distinct, 'name');
    assert.deepEqual(instance._options.field, 'name')
  })
  it('explain', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.explain('name');
    assert.equal(data, instance);
    assert.deepEqual(instance._options.explain, 'name');
  })
  it('optionsFilter', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.optionsFilter('data');
    assert.equal(data, 'data');
  })
  it('dataFilter', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.dataFilter('data');
    assert.equal(data, 'data');
  })
  it('afterAdd', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.afterAdd('data');
    assert.equal(data, 'data');
  })
  it('afterDelete', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.afterDelete('data');
    assert.equal(data, 'data');
  })
  it('afterUpdate', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.afterUpdate('data');
    assert.equal(data, 'data');
  })
  it('afterFind', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.afterFind('data');
    assert.equal(data, 'data');
  })
  it('afterSelect', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.afterSelect('data');
    assert.equal(data, 'data');
  })
  it('data, get', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.data(true);
    assert.deepEqual(data, {});
  })
  it('data, set', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.data({name: 'welefen'});
    assert.deepEqual(data, instance);
    assert.deepEqual(instance._data, {name: 'welefen'})
  })
  it('options, get', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.options(true);
    assert.deepEqual(data, {});
  })
  it('options, set', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.options({where: {_string: 'id=1'}});
    assert.deepEqual(data, instance);
    assert.deepEqual(instance._options, {where: {_string: 'id=1'}})
  })
  it('close', function(){
    var instance = new Base('user', think.config('db'));
    instance.close();
  })
  it('close, has _db', function(){
    var instance = new Base('user', think.config('db'));
    var flag = false;
    instance._db = {
      close: function(){
        flag = true;
      }
    }
    instance.close();
    assert.equal(flag, true);
  })
})