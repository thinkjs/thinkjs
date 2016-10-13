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
    Base = think.safeRequire(path.resolve(__dirname, '../../lib/model/_base.js'));
  })
  it('get instance', function(){
    var instance = new Base('user');
    assert.deepEqual(instance.config, {});
    assert.deepEqual(instance.name, 'user')
  })
  it('get instance, config name', function(){
    var instance = new Base('user', {name: 'test'});
    assert.deepEqual(instance.config, {database: 'test'});
    assert.deepEqual(instance.name, 'user')
  })
  it('get instance, config pwd', function(){
    var instance = new Base('user', {pwd: 'test'});
    assert.deepEqual(instance.config, {password: 'test'});
    assert.deepEqual(instance.name, 'user')
  })
  it('get instance, fields', function(){
    Base.prototype.fields = {name: {}}
    var instance = new Base('user', {pwd: 'test'});
    assert.deepEqual(instance.schema, {name: {}})
    delete Base.prototype.fields;
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
  it('get db instance, without type', function(){
    var config = think.extend({}, think.config('db'));
    delete config.type;
    var instance = new Base('user', config);
    var db = instance.db();
    assert.deepEqual(db.config.type, undefined);
  })
  it('model', function(){
    var instance = new Base('user', think.config('db'));
    var model = instance.model('base');
    assert.deepEqual(think.isObject(model), true);
  })
  it('model, options is string', function(){
    var instance = new Base('user', think.config('db'));
    var model = instance.model('base', 'mongo');
    assert.deepEqual(think.isObject(model), true);
  })
  it('model, options is string, module', function(){
    var modules = think.module;
    think.module = ['test']
    var instance = new Base('user', think.config('db'));
    var model = instance.model('base', 'test');
    assert.deepEqual(think.isObject(model), true);
    think.module = modules;
  })
  it('getTablePrefix', function(){
    var instance = new Base('', think.config('db'));
    instance.tablePrefix = 'think_';
    var data = instance.getTablePrefix();
    assert.equal(data, 'think_');
  })
  it('getTablePrefix', function(){
    var instance = new Base('', think.config('db'));
    delete instance.tablePrefix;
    var data = instance.getTablePrefix();
    assert.equal(data, '');
  })
  it('getModelName', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.getModelName();
    assert.equal(data, 'user')
  })

  it('getModelName, from filename', function(){
    var instance = new Base('', think.config('db'));
    var data = instance.getModelName();
    assert.equal(data.indexOf('base') > -1, true);
  })
  it('getTableName', function(){
    var instance = new Base('user', think.config('db'));
    instance.tablePrefix = 'think_';
    var data = instance.getTableName();
    assert.equal(data, 'think_user')
  })
  it('getTableName, has table name', function(){
    var instance = new Base('user', think.config('db'));
    instance.tableName = 'test';
    instance.tablePrefix = 'think_';
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
  it('limit, with limit, offset 1', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.limit('w', 'd');
    assert.deepEqual(instance._options.limit, [0, 0]);
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
  it('page, with page, array', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.page([3, 10]);
    assert.deepEqual(instance._options.limit, [20, 10]);
  })
  it('page, with page, array 1', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.page([3]);
    assert.deepEqual(instance._options.limit, [20, 10]);
  })
  it('page, with page, array 2', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.page(['w', 'r']);
    assert.deepEqual(instance._options.limit, [0, 10]);
  })
  it('page, with page, array 3', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.page(['w', 1]);
    assert.deepEqual(instance._options.limit, [0, 1]);
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
  it('where, string', function(){
    var instance = new Base('user', think.config('db'));
    instance._options.where = 'status=1';
    var data = instance.where('id=1');
    assert.deepEqual(instance._options.where, {_string: 'id=1'})
  })
  it('where, _string', function(){
    var instance = new Base('user', think.config('db'));
    instance._options.where = 'status=1';
    var data = instance.where('id=1');
    assert.deepEqual(instance._options.where, {_string: 'id=1'})
  })
  it('where, _string 2', function(){
    var instance = new Base('user', think.config('db'));
    instance._options.where = 'status=1';
    var data = instance.where({id: 1});
    assert.deepEqual(instance._options.where, {_string: 'status=1', id: 1})
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
  it('field, string, with (', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.field('(name,title)');
    assert.deepEqual(instance._options.field, '(name,title)')
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
    assert.equal(instance._options.table, 'user');
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
    var data = instance.options();
    assert.deepEqual(data, {});
  })

  it('options, set', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.options({where: {_string: 'id=1'}});
    assert.deepEqual(data, instance);
    assert.deepEqual(instance._options, {where: {_string: 'id=1'}})
  })
  it('options, set', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.options({page: 1});
    assert.deepEqual(data, instance);
    assert.deepEqual(instance._options, {limit: [0, 10], page: 1})
  })
  it('beforeAdd, empty', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.beforeAdd({});
    assert.deepEqual(data, {});
  })
  it('beforeAdd, array', function(){
    var instance = new Base('user', think.config('db'));
    var data = instance.beforeAdd([{name: 1}]);
    assert.deepEqual(data, [{name: 1}]);
  })
  it('beforeAdd, default', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: 'welefen'
      }
    }
    var data = instance.beforeAdd({});
    assert.deepEqual(data, {name: 'welefen'});
  })
  it('beforeAdd, default', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: 'welefen'
      }
    }
    var data = instance.beforeAdd({name: 'suredy'});
    assert.deepEqual(data, {name: 'suredy'});
  })
  it('beforeAdd, default 2', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: null
      }
    }
    var data = instance.beforeAdd({name: 'test'});
    assert.deepEqual(data, {name: 'test'});
  })
   it('beforeAdd, default 4', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return 1}
      }
    }
    var data = instance.beforeAdd({name: ''});
    assert.deepEqual(data, {name: 1});
  })
   it('beforeAdd, default other field', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      }
    }
    var data = instance.beforeAdd({username: 'welefen'});
    assert.deepEqual(data, {name: 'welefen', username: 'welefen'});
  })
   it('beforeAdd, has depth 1', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          default: function () { return 1 }
        },
        updateAt: {
          default: function () { return 2 }
        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen'});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt":1,"updateAt":2}});
  })
   it('beforeAdd, has depth 2', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          default: function () { return 1 }
        },
        updateAt: {
          default: function () { return 2 }
        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      createAt: 3
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt":3,"updateAt":2}});
  })
    it('beforeAdd, has depth 3', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          default: function () { return 1 }
        },
        updateAt: {
          default: function () { return 2 }
        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      createAt: 3,
      updateAt: 4
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt":3,"updateAt":4}});
  })
  it('beforeAdd, has depth 3', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          default: function () { return 1 }
        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      updateAt: 4
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt":1,"updateAt":4}});
  })
  it('beforeAdd, has depth 4', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          default: function () { return 1 }
        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      createAt: 5,
      updateAt: 4
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt":5,"updateAt":4}});
  })
  it('beforeAdd, has depth 5', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          
        },
        updateAt: {

        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      createAt: 5,
      updateAt: 4
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt":5,"updateAt":4}});
  })
  it('beforeAdd, has depth 6', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          xxx: {
            default: function () { return 20 }
          }
        },
        updateAt: {

        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      updateAt: 4
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt": {xxx: 20},"updateAt":4}});
  })
  it('beforeAdd, has depth 7', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      },
      meta: {
        createAt: {
          xxx: {
            default: function () { return 20 }
          }
        },
        updateAt: {

        }
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      createAt: {
        yyy: 5
      },
      updateAt: 4
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt": {xxx: 20, yyy: 5},"updateAt":4}});
  })
  it('beforeAdd, has depth 8', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return this.username}
      }
    }
    var data = instance.beforeAdd({username: 'welefen', meta: {
      createAt: {
        yyy: 5
      },
      updateAt: 4
    }});
    assert.deepEqual(data, {"name":"welefen","username":"welefen","meta":{"createAt": {yyy: 5},"updateAt":4}});
  })
   it('beforeUpdate, emtpy', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return 1}
      }
    }
    var data = instance.beforeUpdate({});
    assert.deepEqual(data, {});
  })
   it('beforeUpdate, update true', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return 1},
        update: true
      }
    }
    var data = instance.beforeUpdate({});
    assert.deepEqual(data, {name: 1});
  })
   it('beforeUpdate, update true', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return 1},
        update: true
      }
    }
    var data = instance.beforeUpdate({name: 0});
    assert.deepEqual(data, {name: 1});
  })
  it('beforeUpdate, update true, readonly true', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        default: function(){return 1},
        update: true,
        readonly: true
      }
    }
    var data = instance.beforeUpdate({});
    assert.deepEqual(data, {});
  })
  it('beforeUpdate, readonly true', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      name: {
        type: 'string',
        readonly: true
      }
    }
    var data = instance.beforeUpdate({name: 'welefen'});
    assert.deepEqual(data, {});
  })

  it('beforeUpdate, has depth 1', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      meta: {
        createAt: {
          default: function () { return 111 },
          update: true
        }
      }
    }
    var data = instance.beforeUpdate({name: 'welefen'});
    assert.deepEqual(data, { name: 'welefen', meta: { createAt: 111 } });
  });
  it('beforeUpdate, has depth 2', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      meta: {
        createAt: {
          default: function () { return 111 },
          readonly: true
        }
      }
    }
    var data = instance.beforeUpdate({
      name: 'welefen', 
      meta: {
        createAt: 444
      }
    });
    assert.deepEqual(data, { name: 'welefen' });
  });
  it('beforeUpdate, has depth 3', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      meta: {
        createAt: {
          default: function () { return 111 },
          readonly: true
        },
        updateAt: {
          default: function () { return 222 },
          update: true
        }
      }
    }
    var data = instance.beforeUpdate({
      name: 'welefen', 
      meta: {
        createAt: 444
      }
    });
    assert.deepEqual(data, { name: 'welefen', meta: {updateAt: 222} });
  });

  it('beforeUpdate, has depth 4', function(){
    var instance = new Base('user', think.config('db'));
    instance.schema = {
      meta: {
        createAt: {
          default: function () { return 111 },
          readonly: true
        },
        updateAt: {
          default: function () { return 222 },
          update: true
        }
      }
    }
    var data = instance.beforeUpdate({
      name: 'welefen', 
      meta: {
        createAt: 444,
        updateAt: 555
      }
    });
    assert.deepEqual(data, { name: 'welefen', meta: {updateAt: 555} });
  });



  it('beforeUpdate, readonlyFields', function(){
    var instance = new Base('user', think.config('db'));
    instance.readonlyFields = ['name']
    var data = instance.beforeUpdate({name: 'welefen'});
    assert.deepEqual(data, {});
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