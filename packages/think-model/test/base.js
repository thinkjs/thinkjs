const ava = require('ava');
const helper = require('think-helper');

const Base = require('../src/base');
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

ava.test('get instance', t => {
  t.plan(2);

  var instance = new Base('user');
  t.deepEqual(instance.config, {});
  t.deepEqual(instance.name, 'user')
})
ava.test('get instance, config name', t => {
  t.plan(2);

  var instance = new Base('user', {database: 'test'});
  t.deepEqual(instance.config, {database: 'test'});
  t.deepEqual(instance.name, 'user')
})
ava.test('get instance, config pwd', t => {
  t.plan(2);

  var instance = new Base('user', {password: 'test'});
  t.deepEqual(instance.config, {password: 'test'});
  t.deepEqual(instance.name, 'user')
})
/** have some question? */
ava.test('get instance, fields', t => {
  Base.prototype.fields = {name: {}}
  var instance = new Base('user', {password: 'test'});
  t.deepEqual(instance.schema, {})
  delete Base.prototype.fields;
})
ava.test('get instance, config contains tableprefix', t => {
  t.plan(3);

  var instance = new Base('user', {
    prefix: 'think_'
  });
  t.deepEqual(instance.config, {
    prefix: 'think_'
  });
  t.deepEqual(instance.name, 'user');
  t.deepEqual(instance.tablePrefix, 'think_')
})
ava.test('get instance, name is object', t => {
  t.plan(3);

  var instance = new Base({
    prefix: 'think_'
  });
  t.deepEqual(instance.config, {
    prefix: 'think_'
  });
  t.deepEqual(instance.name, '');
  t.deepEqual(instance.tablePrefix, 'think_')
})

ava.test('get db instance', t => {
  var instance = new Base('user', DBConfig);
  var db = instance.db();
  t.true(helper.isObject(db));
})
ava.test('get db instance, exist', t => {
  var instance = new Base('user', DBConfig);
  instance._db = true;
  var db = instance.db();
  t.true(db);
})
ava.test('get db instance 1', t => {
  var instance = new Base('user', DBConfig);
  var db = instance.db();
  var db1 = instance.db();
  t.deepEqual(db, db1);
})
// ava.test('get db instance, without type', t => {
//   var config = helper.extend({}, DBConfig);
//   delete config.type;
//   var instance = new Base('user', config);
//   var db = instance.db();
//   t.deepEqual(db.config.type, undefined);
// })
// ava.test('model', t => {
//   var instance = new Base('user', DBConfig);
//   var model = instance.model('base');
//   t.true(helper.isObject(model));
// })
// have not set instance.model() function.
// ava.test('model, options is string', t => {
//   var instance = new Base('user', DBConfig);
//   var model = instance.model('base', 'mongo');
//   t.deepEqual(think.isObject(model), true);
// })
// ava.test('model, options is string, module', t => {
//   var modules = think.module;
//   think.module = ['test']
//   var instance = new Base('user', DBConfig);
//   var model = instance.model('base', 'test');
//   t.deepEqual(think.isObject(model), true);
//   think.module = modules;
// })
ava.test('getTablePrefix', t => {
  t.plan(2);

  var instance = new Base('', DBConfig);
  instance.tablePrefix = 'think_';
  t.is(instance.getTablePrefix(), 'think_');
  delete instance.tablePrefix;
  t.is(instance.getTablePrefix(), '');
})
ava.test('getModelName', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.getModelName();
  t.is(data, 'user')
})
ava.test('getModelName, from filename', t => {
  var instance = new Base('', DBConfig);
  var data = instance.getModelName();
  t.true(data.indexOf('base') > -1);
})
ava.test('getTableName', t => {
  var instance = new Base('user', DBConfig);
  instance.tablePrefix = 'think_';
  var data = instance.getTableName();
  t.is(data, 'think_user')
})
ava.test('getTableName, has table name', t => {
  var instance = new Base('user', DBConfig);
  instance.tableName = 'test';
  instance.tablePrefix = 'think_';
  var data = instance.getTableName();
  t.is(data, 'think_test')
})
// model cache have not set yet!
// ava.test('cache, return this', t => {
//   var instance = new Base('user', DBConfig);
//   var data = instance.cache();
//   t.is(data, instance);
// })
// ava.test('cache, with key', t => {
//   var instance = new Base('user', DBConfig);
//   var data = instance.cache('lizheming');
//   t.deepEqual(instance._options.cache, { on: true, type: '', timeout: 3600, key: 'lizheming' });
// })
// ava.test('cache, with key, has timeout', t => {
//   var instance = new Base('user', DBConfig);
//   var data = instance.cache('lizheming', 3000);
//   t.deepEqual(instance._options.cache, { on: true, type: '', timeout: 3000, key: 'lizheming' })
// })
// ava.test('cache, no key, has timeout', t => {
//   var instance = new Base('user', DBConfig);
//   var data = instance.cache(3000);
//   t.deepEqual(instance._options.cache, { on: true, type: '', timeout: 3000, key: '' })
// })
// ava.test('cache, key is object', t => {
//   var instance = new Base('user', DBConfig);
//   var data = instance.cache({key: 'suredy', timeout: 4000});
//   t.deepEqual(instance._options.cache, {key: 'suredy', timeout: 4000})
// })
ava.test('limit, return this', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.limit();
  t.is(data, instance);
})
ava.test('limit, with limit', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.limit(100);
  t.deepEqual(instance._options.limit, [100, undefined]);
})
ava.test('limit, with limit, offset', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.limit(100, 30);
  t.deepEqual(instance._options.limit, [100, 30]);
})
ava.test('limit, with limit, offset 1', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.limit('w', 'd');
  t.deepEqual(instance._options.limit, [0, 0]);
})
ava.test('page, return this', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.page();
  t.is(data, instance);
})
ava.test('page, with page', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.page(3);
  t.deepEqual(instance._options.limit, [20, 10]);
})
ava.test('page, with page, array', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.page([3, 10]);
  t.deepEqual(instance._options.limit, [20, 10]);
})
ava.test('page, with page, array 1', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.page([3]);
  t.deepEqual(instance._options.limit, [20, 10]);
})
ava.test('page, with page, array 2', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.page(['w', 'r']);
  t.deepEqual(instance._options.limit, [0, 10]);
})
ava.test('page, with page, array 3', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.page(['w', 1]);
  t.deepEqual(instance._options.limit, [0, 1]);
})
ava.test('page, with page, offset', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.page(3, 30);
  t.deepEqual(instance._options.limit, [60, 30]);
})
ava.test('where, return this', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.where();
  t.is(data, instance);
})
ava.test('where, string', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.where('id=1');
  t.deepEqual(instance._options.where, {_string: 'id=1'})
})
ava.test('where, string', t => {
  var instance = new Base('user', DBConfig);
  instance._options.where = 'status=1';
  var data = instance.where('id=1');
  t.deepEqual(instance._options.where, {_string: 'id=1'})
})
ava.test('where, _string', t => {
  var instance = new Base('user', DBConfig);
  instance._options.where = 'status=1';
  var data = instance.where('id=1');
  t.deepEqual(instance._options.where, {_string: 'id=1'})
})
ava.test('where, _string 2', t => {
  var instance = new Base('user', DBConfig);
  instance._options.where = 'status=1';
  var data = instance.where({id: 1});
  t.deepEqual(instance._options.where, {_string: 'status=1', id: 1})
})
ava.test('where, object', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.where({name: 'lizheming'});
  t.deepEqual(instance._options.where, {name: 'lizheming'})
})
ava.test('where, mix', t => {
  var instance = new Base('user', DBConfig);
  instance.where('id=100')
  var data = instance.where({name: 'lizheming'});
  t.deepEqual(instance._options.where, {_string: 'id=100', name: 'lizheming'})
})
ava.test('field, return this', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.field();
  t.is(data, instance);
})
ava.test('field, string', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.field('name,title');
  t.deepEqual(instance._options.field, ['name', 'title'])
  t.deepEqual(instance._options.fieldReverse, false);
})
ava.test('field, string, with (', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.field('(name,title)');
  t.deepEqual(instance._options.field, '(name,title)')
  t.false(instance._options.fieldReverse);
})
ava.test('field, array', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.field(['name', 'title']);
  t.deepEqual(instance._options.field, ['name', 'title'])
  t.false(instance._options.fieldReverse);
})
ava.test('field, string, reverse', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.field('name,title', true);
  t.deepEqual(instance._options.field, ['name', 'title'])
  t.true(instance._options.fieldReverse);
})
ava.test('fieldReverse, string,', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.fieldReverse('name,title');
  t.deepEqual(instance._options.field, ['name', 'title'])
  t.true(instance._options.fieldReverse);
})
ava.test('table, return this', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.table();
  t.is(data, instance);
})
ava.test('table', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.table('user');
  t.is(instance._options.table, 'think_user');
})
ava.test('table, has prefix', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.table('user', true);
  t.is(instance._options.table, 'user');
})
ava.test('table, is select sql', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.table('SELECT * FROM test');
  t.is(instance._options.table, 'SELECT * FROM test');
})
ava.test('union, return this', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.union();
  t.is(data, instance);
})
ava.test('union', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.union('SELECT * FROM test');
  t.deepEqual(instance._options.union, [{
    union: 'SELECT * FROM test',
    all: false
  }]);
})
ava.test('union all', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.union('SELECT * FROM test', true);
  t.deepEqual(instance._options.union, [{
    union: 'SELECT * FROM test',
    all: true
  }]);
})
ava.test('union multi', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.union('SELECT * FROM test1');
  var data = instance.union('SELECT * FROM test', true);
  t.deepEqual(instance._options.union, [{
    union: 'SELECT * FROM test1',
    all: false
  }, {
    union: 'SELECT * FROM test',
    all: true
  }]);
})
ava.test('join, return this', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.join();
  t.is(data, instance);
})
ava.test('join string', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.join('left join test on test.id=user.id');
  t.deepEqual(instance._options.join, ['left join test on test.id=user.id']);
})
ava.test('join array', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.join(['left join test on test.id=user.id']);
  t.deepEqual(instance._options.join, ['left join test on test.id=user.id']);
})
ava.test('join multi', t => {
  var instance = new Base('user', DBConfig);
  instance.join({
    table: 'test1'
  });
  var data = instance.join(['left join test on test.id=user.id']);
  t.deepEqual(instance._options.join, [{table: 'test1'}, 'left join test on test.id=user.id']);
})
ava.test('order', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.order('name desc');
  t.is(data, instance);
  t.deepEqual(instance._options.order, 'name desc')
})
ava.test('alias', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.alias('a');
  t.is(data, instance);
  t.deepEqual(instance._options.alias, 'a')
})
ava.test('having', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.having('a');
  t.is(data, instance);
  t.deepEqual(instance._options.having, 'a')
})
ava.test('group', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.group('a');
  t.is(data, instance);
  t.deepEqual(instance._options.group, 'a')
})
ava.test('lock', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.lock('a');
  t.is(data, instance);
  t.deepEqual(instance._options.lock, 'a')
})
ava.test('auto', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.auto('a');
  t.is(data, instance);
  t.deepEqual(instance._options.auto, 'a')
})
ava.test('filter', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.filter('a');
  t.is(data, instance);
  t.deepEqual(instance._options.filter, 'a')
})
ava.test('distinct, true', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.distinct(true);
  t.is(data, instance);
  t.deepEqual(instance._options.distinct, true)
})
ava.test('distinct, field', t => {
  t.plan(3);

  var instance = new Base('user', DBConfig);
  var data = instance.distinct('name');
  t.is(data, instance);
  t.deepEqual(instance._options.distinct, 'name');
  t.deepEqual(instance._options.field, 'name')
})
ava.test('explain', t => {
  t.plan(2);
  
  var instance = new Base('user', DBConfig);
  var data = instance.explain('name');
  t.is(data, instance);
  t.deepEqual(instance._options.explain, 'name');
})
ava.test('optionsFilter', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.optionsFilter('data');
  t.is(data, 'data');
})
ava.test('dataFilter', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.dataFilter('data');
  t.is(data, 'data');
})
ava.test('afterAdd', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.afterAdd('data');
  t.is(data, 'data');
})
ava.test('afterDelete', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.afterDelete('data');
  t.is(data, 'data');
})
ava.test('afterUpdate', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.afterUpdate('data');
  t.is(data, 'data');
})
ava.test('afterFind', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.afterFind('data');
  t.is(data, 'data');
})
ava.test('afterSelect', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.afterSelect('data');
  t.is(data, 'data');
})
ava.test('data, get', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.data(true);
  t.deepEqual(data, {});
})
ava.test('data, set', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.data({name: 'lizheming'});
  t.deepEqual(data, instance);
  t.deepEqual(instance._data, {name: 'lizheming'})
})
ava.test('options, get', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.options();
  t.deepEqual(data, {});
})
ava.test('options, set', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.options({where: {_string: 'id=1'}});
  t.deepEqual(data, instance);
  t.deepEqual(instance._options, {where: {_string: 'id=1'}})
})
ava.test('options, set', t => {
  t.plan(2);

  var instance = new Base('user', DBConfig);
  var data = instance.options({page: 1});
  t.deepEqual(data, instance);
  t.deepEqual(instance._options, {limit: [0, 10], page: 1})
})
ava.test('beforeAdd, empty', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.beforeAdd({});
  t.deepEqual(data, {});
})
ava.test('beforeAdd, array', t => {
  var instance = new Base('user', DBConfig);
  var data = instance.beforeAdd([{name: 1}]);
  t.deepEqual(data, [{name: 1}]);
})
ava.test('beforeAdd, default', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: 'lizheming'
    }
  }
  var data = instance.beforeAdd({});
  t.deepEqual(data, {name: 'lizheming'});
})
ava.test('beforeAdd, default', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: 'lizheming'
    }
  }
  var data = instance.beforeAdd({name: 'suredy'});
  t.deepEqual(data, {name: 'suredy'});
})
ava.test('beforeAdd, default 2', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: null
    }
  }
  var data = instance.beforeAdd({name: 'test'});
  t.deepEqual(data, {name: 'test'});
})
ava.test('beforeAdd, default 4', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: t => {return 1}
    }
  }
  var data = instance.beforeAdd({name: ''});
  t.deepEqual(data, {name: 1});
})
ava.test('beforeAdd, default other field', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() {
        return this.username;
      }
    }
  }
  var data = instance.beforeAdd({username: 'lizheming'});
  t.deepEqual(data, {
    name: 'lizheming', 
    username: 'lizheming'
  });
})
ava.test('beforeAdd, has depth 1', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() {return this.username}
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
  var data = instance.beforeAdd({username: 'lizheming'});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: 1,
      updateAt: 2
    }
  });
})
ava.test('beforeAdd, has depth 2', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() {return this.username}
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
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    createAt: 3
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: 3,
      updateAt: 2
    }
  });
})
ava.test('beforeAdd, has depth 3', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() {return this.username}
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
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    createAt: 3,
    updateAt: 4
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: 3,
      updateAt: 4
    }
  });
})
ava.test('beforeAdd, has depth 3', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() {return this.username}
    },
    meta: {
      createAt: {
        default: function () { return 1 }
      }
    }
  }
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    updateAt: 4
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: 1,
      updateAt: 4
    }
  });
})
ava.test('beforeAdd, has depth 4', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() { return this.username; }
    },
    meta: {
      createAt: {
        default: function () { return 1 }
      }
    }
  }
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    createAt: 5,
    updateAt: 4
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: 5,
      updateAt: 4
    }
  });
})
ava.test('beforeAdd, has depth 5', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() { return this.username; }
    },
    meta: {
      createAt: {
        
      },
      updateAt: {

      }
    }
  }
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    createAt: 5,
    updateAt: 4
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: 5,
      updateAt: 4
    }
  });
})
ava.test('beforeAdd, has depth 6', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() { return this.username; }
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
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    updateAt: 4
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: {
        xxx: 20
      },
      updateAt: 4
    }
  });
})
ava.test('beforeAdd, has depth 7', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() { return this.username; }
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
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    createAt: {
      yyy: 5
    },
    updateAt: 4
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: {
        xxx: 20,
        yyy: 5
      },
      updateAt: 4
    }
  });
})
ava.test('beforeAdd, has depth 8', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: function() { return this.username; }
    }
  }
  var data = instance.beforeAdd({username: 'lizheming', meta: {
    createAt: {
      yyy: 5
    },
    updateAt: 4
  }});
  t.deepEqual(data, {
    name: 'lizheming',
    username: 'lizheming',
    meta: {
      createAt: {
        yyy: 5
      },
      updateAt: 4
    }
  });
})
ava.test('beforeUpdate, emtpy', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: t => {return 1}
    }
  }
  var data = instance.beforeUpdate({});
  t.deepEqual(data, {});
})
ava.test('beforeUpdate, update true', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: t => {return 1},
      update: true
    }
  }
  var data = instance.beforeUpdate({});
  t.deepEqual(data, {name: 1});
})
ava.test('beforeUpdate, update true', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: t => {return 1},
      update: true
    }
  }
  var data = instance.beforeUpdate({name: 0});
  t.deepEqual(data, {name: 1});
})
ava.test('beforeUpdate, update true, readonly true', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      default: t => {return 1},
      update: true,
      readonly: true
    }
  }
  var data = instance.beforeUpdate({});
  t.deepEqual(data, {});
})
ava.test('beforeUpdate, readonly true', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    name: {
      type: 'string',
      readonly: true
    }
  }
  var data = instance.beforeUpdate({name: 'lizheming'});
  t.deepEqual(data, {});
})

ava.test('beforeUpdate, has depth 1', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    meta: {
      createAt: {
        default: function () { return 111 },
        update: true
      }
    }
  }
  var data = instance.beforeUpdate({name: 'lizheming'});
  t.deepEqual(data, { name: 'lizheming', meta: { createAt: 111 } });
});
ava.test('beforeUpdate, has depth 2', t => {
  var instance = new Base('user', DBConfig);
  instance.schema = {
    meta: {
      createAt: {
        default: function () { return 111 },
        readonly: true
      }
    }
  }
  var data = instance.beforeUpdate({
    name: 'lizheming', 
    meta: {
      createAt: 444
    }
  });
  t.deepEqual(data, { name: 'lizheming' });
});
ava.test('beforeUpdate, has depth 3', t => {
  var instance = new Base('user', DBConfig);
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
    name: 'lizheming', 
    meta: {
      createAt: 444
    }
  });
  t.deepEqual(data, { name: 'lizheming', meta: {updateAt: 222} });
});

ava.test('beforeUpdate, has depth 4', t => {
  var instance = new Base('user', DBConfig);
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
    name: 'lizheming', 
    meta: {
      createAt: 444,
      updateAt: 555
    }
  });
  t.deepEqual(data, { name: 'lizheming', meta: {updateAt: 555} });
});
ava.test('close', t => {
  var instance = new Base('user', DBConfig);
  instance.close();
  t.pass();
})
ava.test('close, has _db', t => {
  var instance = new Base('user', DBConfig);
  var flag = false;
  instance._db = {
    close: t => {
      flag = true;
    }
  }
  instance.close();
  t.is(flag, true);
})