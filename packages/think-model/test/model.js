const {test} = require('ava');
const Model = require('../src/model');

test('model instance normal', t => {
  t.plan(3);

  const config = {
    handle: new Function()
  };
  const modelName = 'post';
  const model = new Model(modelName, config);
  t.is(model.modelName, modelName);
  t.is(model.config, config);
  t.deepEqual(model.options, {});
});
test('model instance abnormal', t => {
  try {
    new Model({handle: 111});
    t.fail();
  } catch (e) {
    t.pass();
  }
});
test('model get db', t => {
  const config = {
    handle: new Function()
  };
  const model = new Model(config);
  t.true(model.db() instanceof config.handle);
});
test('model get models', t => {
  t.plan(2);
  const models = {post: {}};
  const model = new Model({handle: new Function()});
  t.deepEqual(model.models, {});
  model.models = models;
  t.is(model.models, models);
});
test('model get table prefix', t => {
  t.plan(2);

  t.is((new Model({handle: new Function()})).tablePrefix, '');

  const model = new Model({handle: new Function(), prefix: 'fk_'});
  t.is(model.tablePrefix, 'fk_');
});
test('model get table name', t => {
  t.plan(2);
  let model = new Model('post', {handle: new Function()});
  t.is(model.tableName, 'post');

  model = new Model('post', {handle: new Function(), prefix: 'fk_'});
  t.is(model.tableName, 'fk_post');
});
test('model get pk', t => {
  t.plan(2);
  const model = new Model({handle: new Function()});
  t.is(model.pk, 'id');
  model._pk = 'user_id';
  t.is(model.pk, model._pk);
});
test('model get model inline', t => {
  t.plan(3);

  const model = new Model('post', {handle: new Function(), prefix: 'fk_'});
  model.models = {
    'admin/user': function(tableName) {
      this.tableName = tableName;
    }
  };

  t.is(model.model('user').tablePrefix, 'fk_');
  t.is(model.model('user').models, model.models);
  t.is(model.model('admin/user').tableName, 'user');
});
test('model set cache option', t => {
  t.plan(5);

  const model = new Model('post', {
    handle: new Function(),
    cache: {
      type: 'file'
    }
  });

  model.cache(500);
  t.is(model.options.cache.timeout, 500);
  model.cache({type: 'session'});
  t.is(model.options.cache.type, 'session');
  model.cache('page', {timeout: 300});
  t.is(model.options.cache.key, 'page');
  t.is(model.options.cache.timeout, 300);
  model.cache('page', {key: 'post'});
  t.is(model.options.cache.key, 'post');
});
test('model set limit', t => {
  t.plan(6);

  const model = new Model('post', {handle: new Function()});
  model.limit();
  t.is(model.options.limit, undefined);
  model.limit([1]);
  t.deepEqual(model.options.limit, [1, undefined]);
  model.limit([1, 2]);
  t.deepEqual(model.options.limit, [1, 2]);
  model.limit(-1, -1);
  t.deepEqual(model.options.limit, [0, 0]);
  model.limit([-1, -10]);
  t.deepEqual(model.options.limit, [0, 0]);
  model.limit([]);
  t.deepEqual(model.options.limit, [0, undefined]);
});
test('model set page', t => {
  const model = new Model('post', {handle: new Function()});
  model.page();
  t.deepEqual(model.options.limit, [0, 10]);
  model.page(0);
  t.deepEqual(model.options.limit, [0, 10]);
  model.page(2);
  t.deepEqual(model.options.limit, [10, 10]);
  model.page(0, 30);
  t.deepEqual(model.options.limit, [0, 30]);
  model.page([3, 20]);
  t.deepEqual(model.options.limit, [40, 20]);
});
test('model set where', t => {
  t.plan(4);

  const model = new Model('post', {handle: new Function()});
  model.where();
  t.is(model.options.where, undefined);
  model.where('hello');
  t.is(model.options.where._string, 'hello');
  model.options.where = 'hello';
  model.where('123');
  t.is(model.options.where._string, '123');
  delete model.options.where;
  model.where({id: ['>', 30]});
  t.deepEqual(model.options.where, {id: ['>', 30]});
});
test('model set field reverse', t => {
  t.plan(8);

  const model = new Model('post', {handle: new Function()});
  model.field();
  t.is(model.options.field, undefined);
  t.is(model.options.fieldReverse, undefined);
  model.field('hello');
  t.is(model.options.field, 'hello');
  t.is(model.options.fieldReverse, false);
  model.field('hello', true);
  t.is(model.options.field, 'hello');
  t.is(model.options.fieldReverse, true);
  model.fieldReverse('hello2');
  t.is(model.options.field, 'hello2');
  t.is(model.options.fieldReverse, true);
});

test('model set table name', t => {
  t.plan(4);

  const model = new Model('post', {handle: new Function(), prefix: 'fk_'});
  model.table();
  t.is(model.options.table, undefined);
  model.table('  user  ');
  t.is(model.options.table, 'fk_user');
  model.table('SELECT * FROM user');
  t.is(model.options.table, 'SELECT * FROM user');
  model.table('user', true);
  t.is(model.options.table, 'user');
});

test('model set union', t => {
  t.plan(3);

  const model = new Model('post', {handle: new Function()});
  model.union();
  t.is(model.options.union, undefined);
  model.union('test');
  t.deepEqual(model.options.union, [{union: 'test', all: false}]);
  model.union('test2', true);
  t.deepEqual(model.options.union, [{union: 'test', all: false}, {union: 'test2', all: true}]);
});

test('model set join', t => {
  t.plan(3);

  const model = new Model('post', {handle: new Function()});
  model.join();
  t.is(model.options.join, undefined);
  model.join(222);
  t.deepEqual(model.options.join, [222]);
  model.join([1, 2, 3, 4]);
  t.deepEqual(model.options.join, [222, 1, 2, 3, 4]);
});

test('model set order alias having group lock auto explan distinct', t => {
  t.plan(9);

  const model = new Model('post', {handle: new Function()});
  t.is(model.order('id').options.order, 'id');
  t.is(model.alias('user').options.alias, 'user');
  t.is(model.having('user').options.having, 'user');
  t.is(model.group('user').options.group, 'user');
  t.is(model.lock('user').options.lock, 'user');
  t.is(model.auto('user').options.auto, 'user');
  t.is(model.explain('user').options.explain, 'user');
  t.is(model.distinct('user').options.field, 'user');
  t.deepEqual(model.distinct({field: 'user'}).options.distinct, {field: 'user'});
});

test('model after find', t => {
  t.pass();
});

test('model after select', t => {
  t.pass();
});
