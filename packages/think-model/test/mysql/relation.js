const muk = require('muk');
const {test} = require('ava');

const Relation = require('../../src/mysql/relation');
const mysqlInstance = require('../../src/mysql/instance');
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
DBConfig.models = {
  cate: new Relation('cate', DBConfig)
}

test('init', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  t.is(instance._relationName, true);
  t.deepEqual(instance.relation, {});
})
test('setRelation, undefined', t => {
  let instance = new Relation('user', DBConfig);
  let value = instance.setRelation();
  t.is(value, instance)
})
test('setRelation, true', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  let value = instance.setRelation(true);
  t.is(value, instance);
  t.is(instance._relationName, true)
})
test('setRelation, false', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  let value = instance.setRelation(false);
  t.is(value, instance);
  t.is(instance._relationName, false)
})
test('setRelation, object', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  let value = instance.setRelation({cate: Relation.HAS_ONE});
  t.is(value, instance);
  t.deepEqual(instance.relation, {cate: Relation.HAS_ONE})
})
test('setRelation, string, value', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  let value = instance.setRelation('cate', Relation.HAS_ONE);
  t.is(value, instance);
  t.deepEqual(instance.relation, {cate: Relation.HAS_ONE})
})
test('setRelation, string', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  let value = instance.setRelation('cate');
  t.is(value, instance);
  t.deepEqual(instance._relationName, ['cate'])
})
test('setRelation, string, reverse', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: Relation.HAS_ONE, user: Relation.HAS_ONE}
  let value = instance.setRelation('cate', false);
  t.is(value, instance);
  t.deepEqual(instance._relationName, ['user'])
})
test('setRelation, null', t => {
  t.plan(2);

  let instance = new Relation('user', DBConfig);
  let value = instance.setRelation(null);
  t.is(value, instance);
  t.deepEqual(instance._relationName, [])
})
test('afterFind', async t => {
  let instance = new Relation('user', DBConfig);
  instance.getRelation = function(data, options){
    return Promise.resolve([{name: 1}]);
  }
  
  let data = await instance.afterFind([], {});
  t.deepEqual(data, [{name: 1}]);
})
test('afterSelect', async t => {
  let instance = new Relation('user', DBConfig);
  instance.getRelation = function(data, options){
    return Promise.resolve([{name: 1}]);
  }
  let data = await instance.afterSelect([], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, data empty', async t => {
  let instance = new Relation('user', DBConfig);
  let data = await instance.getRelation([]);
  t.deepEqual(data, []);
})
test('getRelation, relation empty', async t => {
  let instance = new Relation('user', DBConfig);
  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, _relationName empty', async t => {
  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: Relation.HAS_ONE}
  instance._relationName = false;
  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, HAS_ONE, _relationName is true', async t => {
  t.plan(3);

  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: Relation.HAS_ONE}
  instance.getSchema = t => Promise.resolve();

  instance._getHasOneRelation = function(data, opts, options){
    t.deepEqual(data, [ { name: 1 } ]);
    delete opts.model;
    t.deepEqual(opts, {"name":"cate","type":Relation.HAS_ONE,"key":"id","fKey":"user_id","relation":true})
    return Promise.resolve();
  }
  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, HAS_ONE, _relationName contain', async t => {
  t.plan(3);

  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: Relation.HAS_ONE}
  instance._relationName = ['cate'];
  instance.getSchema = () => Promise.resolve();
  instance._getHasOneRelation = function(data, opts, options){
    t.deepEqual(data, [ { name: 1 } ]);
    delete opts.model;
    t.deepEqual(opts, {"name":"cate","type":Relation.HAS_ONE,"key":"id","fKey":"user_id","relation":true})
    return Promise.resolve();
  }
  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, HAS_ONE, _relationName not contain', async t => {
  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: Relation.HAS_ONE}
  instance._relationName = ['user'];
  instance.getSchema = () => Promise.resolve();

  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, HAS_ONE, config not simple', async t => {
  t.plan(3);

  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: {type: Relation.HAS_ONE}}
  instance._relationName = ['cate'];
  instance._getHasOneRelation = function(data, opts, options){
    t.deepEqual(data, [ { name: 1 } ]);
    delete opts.model;
    t.deepEqual(opts, {"name":"cate","type":Relation.HAS_ONE,"key":"id","fKey":"user_id","relation":true})
    return Promise.resolve();
  }
  instance.getSchema = () => Promise.resolve();

  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, HAS_ONE, data exist', async t => {
  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: {type: Relation.HAS_ONE}}
  instance._relationName = ['cate'];
  instance.getSchema = () => Promise.resolve();
  
  let data = await instance.getRelation({id: 1, value: 'thinkjs', cate: {user_id: 10}});
  t.deepEqual(data, {id: 1, value: 'thinkjs', cate: {user_id: 10}});
})
test('getRelation, HAS_ONE, options is function', async t => {
  t.plan(3);

  let instance = new Relation('user', DBConfig);
  instance.findModel = () => new Relation('cate', DBConfig);
  instance.relation = {cate: {type: Relation.HAS_ONE, page: function(){return 10}}}
  instance._relationName = ['cate'];
  instance.getSchema = () => Promise.resolve();
  instance._getHasOneRelation = function(data, opts, options){
    t.is(JSON.stringify(opts.model._options), '{"limit":[90,10],"page":10}')
    t.deepEqual(data, {id: 1, value: 'thinkjs'});
    return Promise.resolve();
  }
  
  let data = await instance.getRelation({id: 1, value: 'thinkjs'});
  t.deepEqual(data, {id: 1, value: 'thinkjs'});
})
test('getRelation, HAS_ONE, has relation', async t => {
  t.plan(4);
  let instance = new Relation('user', DBConfig);
  let cateRelation = new Relation('cate', DBConfig);
  cateRelation.options = () => {
    return {
      setRelation: function(relation, flag){
        t.false(relation);
        t.false(flag);
      }
    }
  };
  instance.findModel = () => cateRelation;

  instance.relation = {cate: {type: Relation.HAS_ONE, relation: false}}
  instance._relationName = ['cate'];
  instance.getSchema = () => Promise.resolve();
  instance._getHasOneRelation = function(data, opts, options){
    t.deepEqual(data, {id: 1, value: 'thinkjs'});
    return Promise.resolve();
  }
  
  let data = await instance.getRelation({id: 1, value: 'thinkjs'});
  t.deepEqual(data, {id: 1, value: 'thinkjs'});
})
test('getRelation, BELONG_TO, _relationName contain', async t => {
  t.plan(3);
  
  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: Relation.BELONG_TO}
  instance._relationName = ['cate'];
  instance.getSchema = () => Promise.resolve();
  instance._getBelongsToRelation = function(data, opts, options){
    t.deepEqual(data, [ { name: 1 } ]);
    delete opts.model;
    t.deepEqual(opts, {"name":"cate","type":Relation.BELONG_TO,"key":"cate_id","fKey":"id","relation":true})
    return Promise.resolve();
  }
  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, HAS_MANY, _relationName contain', async t => {
  t.plan(3);

  let instance = new Relation('user', DBConfig);
  instance.findModel = () => new Relation('cate', DBConfig);
  instance.relation = {cate: Relation.HAS_MANY}
  instance._relationName = ['cate'];
  instance.getSchema = () => Promise.resolve();
  instance._getHasManyRelation = function(data, opts, options){
    t.deepEqual(data, [ { name: 1 } ]);
    delete opts.model;
    t.deepEqual(opts, {"name":"cate","type":Relation.HAS_MANY,"key":"id","fKey":"user_id","relation":true})
    return Promise.resolve();
  }

  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('getRelation, MANY_TO_MANY, _relationName contain', async t => {
  t.plan(3);

  let instance = new Relation('user', DBConfig);
  instance.relation = {cate: Relation.MANY_TO_MANY}
  instance._relationName = ['cate'];
  instance.getSchema = () => Promise.resolve();
  instance._getManyToManyRelation = function(data, opts, options){
    t.deepEqual(data, [ { name: 1 } ]);
    delete opts.model;
    t.deepEqual(opts, {"name":"cate","type":Relation.MANY_TO_MANY,"key":"id","fKey":"user_id","relation":true})
    return Promise.resolve();
  }
  
  let data = await instance.getRelation([{name: 1}], {});
  t.deepEqual(data, [{name: 1}]);
})
test('_postBelongsToRelation', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance._postBelongsToRelation([]);
  t.deepEqual(data, [])
})
test('parseRelationWhere object', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationWhere({id: 10, name: 'thinkjs'}, {fKey: 'user_id', key: 'id'});
  t.deepEqual(data, { user_id: 10 })
})
test('parseRelationWhere array', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationWhere([{id: 10, name: 'thinkjs'}, {id: 11}], {fKey: 'user_id', key: 'id'});
  t.deepEqual(data, { user_id: ['IN', ['10', '11']] } )
})
test('parseRelationData, empty', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationData({id: 10, name: 'thinkjs'}, [], {fKey: 'user_id', key: 'id', name: 'cate'});
  t.deepEqual(data, { id: 10, name: 'thinkjs', cate: {} })
})
test('parseRelationData, empty, array', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationData({id: 10, name: 'thinkjs'}, [], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
  t.deepEqual(data, { id: 10, name: 'thinkjs', cate: [] })
})
test('parseRelationData, array, empty', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
  t.deepEqual(data, [ { id: 10, name: 'thinkjs', cate: [] } ])
})
test('parseRelationData, array', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [{
    user_id: 10,
    title: 'title'
  }], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
  t.deepEqual(data, [{"id":10,"name":"thinkjs","cate":[{"user_id":10,"title":"title"}]}])
})
test('parseRelationData, array 1', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [{
    user_id: 10,
    title: 'title'
  }, {
    user_id: 11,
    title: 'title1'
  }], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
  t.deepEqual(data, [{"id":10,"name":"thinkjs","cate":[{"user_id":10,"title":"title"}]}])
})
test('parseRelationData, array 2', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [{
    user_id: 10,
    title: 'title'
  }, {
    user_id: 11,
    title: 'title1'
  }], {fKey: 'user_id', key: 'id', name: 'cate'});
  t.deepEqual(data, [{"id":10,"name":"thinkjs","cate":{"user_id":10,"title":"title"}}])
})
test('parseRelationData, (issue-417)', t => {
  let instance = new Relation('user', DBConfig);
  let data = instance.parseRelationData([{id: 10, cate: 10, name: 'thinkjs'}], [{
    user_id: 10,
    title: 'title'
  }, {
    user_id: 11,
    title: 'title1'
  }], {fKey: 'user_id', key: 'cate', name: 'cate'});
  t.deepEqual(data, [{"id":10,"name":"thinkjs","cate":{"user_id":10,"title":"title"}}])
})
test('afterAdd', t => {
  let instance = new Relation('user', DBConfig);
  instance.postRelation = function(type){
    t.is(type, 'ADD')
  }
  instance.afterAdd();
})
test('afterDelete', t => {
  let instance = new Relation('user', DBConfig);
  instance.postRelation = function(type){
    t.is(type, 'DELETE')
  }
  instance.afterDelete({});
})
test('afterUpdate', t => {
  let instance = new Relation('user', DBConfig);
  instance.postRelation = function(type){
    t.is(type, 'UPDATE')
  }
  instance.afterUpdate();
})
test('getRelationTableName', t => {
  let instance = new Relation('post', DBConfig);
  instance.tablePrefix = 'think_';
  let model = new Relation('cate', DBConfig);
  model.tablePrefix = 'think_';
  let table = instance.getRelationTableName(model);
  t.is(table, 'think_post_cate')
})
test('getRelationModel', t => {
  let instance = new Relation('post', DBConfig);
  let model = new Relation('cate', DBConfig);
  instance.findModel = () => new Relation('post_cate');
  
  let model1 = instance.getRelationModel(model);
  t.is(model1.name, 'post_cate')
})
test('_getHasOneRelation', async t => {
  let instance = new Relation('post', DBConfig);
  let model = new Relation('detail', DBConfig);
  model.select = t => {
    return [{post: 10, content: 'detail1'}]
  }
  let data = {id: 10, title: 'post1'}
  data = await instance._getHasOneRelation(data, {
    name: 'detail',
    model: model
  });
  t.deepEqual(data, {"id":10,"title":"post1","detail":{"post":10,"content":"detail1"}});
})
test('_getBelongsToRelation', async t => {
  let instance = new Relation('detail', DBConfig);
  let model = new Relation('post', DBConfig);
  model.getPk = t => {
    return 'id';
  }
  model.select = t => {
    return [{id: 10, content: 'detail1'}]
  }
  let data = {post_id: 10, title: 'post1'}
  data = await instance._getBelongsToRelation(data, {
    name: 'post',
    model: model
  });
  //console.log(JSON.stringify(data))
  t.deepEqual(data, {"post_id":10,"title":"post1","post":{"id":10,"content":"detail1"}})
})
test('_getHasManyRelation', async t => {
  let instance = new Relation('post', DBConfig);
  let model = new Relation('detail', DBConfig);
  model.select = t => {
    return [{post: 10, content: 'detail1'}]
  }
  let data = {id: 10, title: 'post1'}
  data = await instance._getHasManyRelation(data, {
    name: 'detail',
    model: model
  });
  t.deepEqual(data, {"id":10,"title":"post1","detail":[{"post":10,"content":"detail1"}]})
})
test('_getManyToManyRelation', async t => {
  t.plan(2);

  let instance = new Relation('post', DBConfig);
  instance.tablePrefix = 'think_';
  let model = new Relation('cate', DBConfig);
  model.tablePrefix = 'think_';
  model.getPk = t => {
    return 'id';
  }
  instance._db = new mysqlInstance(DBConfig);
  instance._db.select = function(sql){
    t.is(sql.trim(), 'SELECT b.*, a.cate_id FROM think_post_cate as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id');
    return [{
      post_id: 10,
      cate_id: 1,
      name: 'cate1'
    }]
  };

  let data = {id: 10, title: 'post1'}
  data = await instance._getManyToManyRelation(data, {
    name: 'cate',
    key: 'id',
    fKey: 'cate_id',
    model: model
  }, {});
  //console.log(JSON.stringify(data))
  t.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]})
})
test('_getManyToManyRelation, has table name', async t => {
  t.plan(2);

  let instance = new Relation('post', DBConfig);
  let model = new Relation('cate', DBConfig);
  instance.tablePrefix = 'think_';
  model.tablePrefix = 'think_';
  model.getPk = t => {
    return 'id';
  }
  instance._db = new mysqlInstance(DBConfig);
  instance._db.select = function(sql){
    t.is(sql.trim(), 'SELECT b.*, a.cate_id FROM think_p_c as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id');
    return [{
      post_id: 10,
      cate_id: 1,
      name: 'cate1'
    }]
  };

  let data = {id: 10, title: 'post1'}
  data = await instance._getManyToManyRelation(data, {
    name: 'cate',
    key: 'id',
    fKey: 'cate_id',
    model: model,
    rModel: 'p_c'
  }, {});
  //console.log(JSON.stringify(data))
  t.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]})
})
test('_getManyToManyRelation, has table name & prefix', async t => {
  t.plan(2);

  let instance = new Relation('post', DBConfig);
  let model = new Relation('cate', DBConfig);
  model.tablePrefix = 'think_';
  model.getPk = t => {
    return 'id';
  }
  instance._db = new mysqlInstance(DBConfig);
  instance._db.select = function(sql){
    t.is(sql.trim(), 'SELECT b.*, a.cate_id FROM think_p_c as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id');
    return [{
      post_id: 10,
      cate_id: 1,
      name: 'cate1'
    }]
  };

  let data = {id: 10, title: 'post1'}
  data = await instance._getManyToManyRelation(data, {
    name: 'cate',
    key: 'id',
    fKey: 'cate_id',
    model: model,
    rModel: 'think_p_c'
  }, {});
  //console.log(JSON.stringify(data))
  t.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]})
})
test('_getManyToManyRelation, has where', async t => {
  t.plan(2);

  let instance = new Relation('post', DBConfig);
  let model = new Relation('cate', DBConfig);
  instance.tablePrefix = 'think_';
  model.tablePrefix = 'think_';
  model.getPk = t => {
    return 'id';
  }
  instance._db = new mysqlInstance(DBConfig);
  instance._db.select = function(sql){
    t.is(sql.trim(), 'SELECT b.*, a.cate_id FROM think_p_c as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id  AND name=1');
    return [{
      post_id: 10,
      cate_id: 1,
      name: 'cate1'
    }]
  };
  instance.getDB = () => mysqlInstance;
  let data = {id: 10, title: 'post1'}
  data = await instance._getManyToManyRelation(data, {
    name: 'cate',
    key: 'id',
    fKey: 'cate_id',
    model: model,
    rModel: 'p_c',
    where: 'name=1'
  }, {});

  //console.log(JSON.stringify(data))
  t.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]});
})