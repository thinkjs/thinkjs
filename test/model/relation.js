'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var Relation = think.safeRequire(path.resolve(__dirname, '../../lib/model/relation.js'));

describe('model/relation.js', function(){
  it('init', function(){
    var instance = new Relation('user', think.config('db'));
    assert.equal(instance._relationName, true);
    assert.deepEqual(instance.relation, {});
  })
  it('setRelation, undefined', function(){
    var instance = new Relation('user', think.config('db'));
    var value = instance.setRelation();
    assert.equal(value, instance)
  })
  it('setRelation, true', function(){
    var instance = new Relation('user', think.config('db'));
    var value = instance.setRelation(true);
    assert.equal(value, instance);
    assert.equal(instance._relationName, true)
  })
  it('setRelation, false', function(){
    var instance = new Relation('user', think.config('db'));
    var value = instance.setRelation(false);
    assert.equal(value, instance);
    assert.equal(instance._relationName, false)
  })
  it('setRelation, object', function(){
    var instance = new Relation('user', think.config('db'));
    var value = instance.setRelation({cate: think.model.HAS_ONE});
    assert.equal(value, instance);
    assert.deepEqual(instance.relation, {cate: think.model.HAS_ONE})
  })
  it('setRelation, string, value', function(){
    var instance = new Relation('user', think.config('db'));
    var value = instance.setRelation('cate', think.model.HAS_ONE);
    assert.equal(value, instance);
    assert.deepEqual(instance.relation, {cate: think.model.HAS_ONE})
  })
  it('setRelation, string', function(){
    var instance = new Relation('user', think.config('db'));
    var value = instance.setRelation('cate');
    assert.equal(value, instance);
    assert.deepEqual(instance._relationName, ['cate'])
  })
  it('setRelation, string, reverse', function(){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.HAS_ONE, user: think.model.HAS_ONE}
    var value = instance.setRelation('cate', false);
    assert.equal(value, instance);
    assert.deepEqual(instance._relationName, ['user'])
  })
  it('setRelation, null', function(){
    var instance = new Relation('user', think.config('db'));
    var value = instance.setRelation(null);
    assert.equal(value, instance);
    assert.deepEqual(instance._relationName, [])
  })
  it('afterFind', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.getRelation = function(data, options){
      return Promise.resolve([{name: 1}]);
    }
    instance.afterFind([], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('afterSelect', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.getRelation = function(data, options){
      return Promise.resolve([{name: 1}]);
    }
    instance.afterSelect([], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, data empty', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.getRelation([]).then(function(data){
      assert.deepEqual(data, [])
      done();
    });
  })
  it('getRelation, relation empty', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, _relationName empty', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.HAS_ONE}
    instance._relationName = false;
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, HAS_ONE, _relationName is true', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.HAS_ONE}
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance._getHasOneRelation = function(data, opts, options){
      assert.deepEqual(data, [ { name: 1 } ]);
      delete opts.model;
      assert.deepEqual(opts, {"name":"cate","type":think.model.HAS_ONE,"key":"id","fKey":"user_id","relation":true})
      return Promise.resolve();
    }
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, HAS_ONE, _relationName contain', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.HAS_ONE}
    instance._relationName = ['cate'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance._getHasOneRelation = function(data, opts, options){
      assert.deepEqual(data, [ { name: 1 } ]);
      delete opts.model;
      assert.deepEqual(opts, {"name":"cate","type":think.model.HAS_ONE,"key":"id","fKey":"user_id","relation":true})
      return Promise.resolve();
    }
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, HAS_ONE, _relationName not contain', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.HAS_ONE}
    instance._relationName = ['user'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, HAS_ONE, config not simple', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: {type: think.model.HAS_ONE}}
    instance._relationName = ['cate'];
    instance._getHasOneRelation = function(data, opts, options){
      assert.deepEqual(data, [ { name: 1 } ]);
      delete opts.model;
      assert.deepEqual(opts, {"name":"cate","type":think.model.HAS_ONE,"key":"id","fKey":"user_id","relation":true})
      return Promise.resolve();
    }
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, HAS_ONE, data exist', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: {type: think.model.HAS_ONE}}
    instance._relationName = ['cate'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance.getRelation({id: 1, value: 'thinkjs', cate: {user_id: 10}}).then(function(data){
      assert.deepEqual(data, {id: 1, value: 'thinkjs', cate: {user_id: 10}})
      done();
    });
  })
  it('getRelation, HAS_ONE, options is function', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: {type: think.model.HAS_ONE, page: function(){return 10}}}
    instance._relationName = ['cate'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance._getHasOneRelation = function(data, opts, options){
      assert.equal(JSON.stringify(opts.model._options), '{"limit":[90,10],"page":10}')
      assert.deepEqual(data, {id: 1, value: 'thinkjs'});
      return Promise.resolve();
    }
    instance.getRelation({id: 1, value: 'thinkjs'}).then(function(data){
      assert.deepEqual(data, {id: 1, value: 'thinkjs'})
      done();
    });
  })
  it('getRelation, HAS_ONE, has relation', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: {type: think.model.HAS_ONE, relation: false}}
    instance._relationName = ['cate'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance.model = function(){
      return {
        options: function(){
          return {
            setRelation: function(relation, flag){
              assert.equal(relation, false);
              assert.equal(flag, false);
            }
          }
        }
      }
    }
    instance._getHasOneRelation = function(data, opts, options){
      assert.deepEqual(data, {id: 1, value: 'thinkjs'});
      return Promise.resolve();
    }
    instance.getRelation({id: 1, value: 'thinkjs'}).then(function(data){
      assert.deepEqual(data, {id: 1, value: 'thinkjs'})
      done();
    })
  })
  it('getRelation, BELONG_TO, _relationName contain', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.BELONG_TO}
    instance._relationName = ['cate'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance._getBelongsToRelation = function(data, opts, options){
      assert.deepEqual(data, [ { name: 1 } ]);
      delete opts.model;
      assert.deepEqual(opts, {"name":"cate","type":think.model.BELONG_TO,"key":"cate_id","fKey":"id","relation":true})
      return Promise.resolve();
    }
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, HAS_MANY, _relationName contain', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.HAS_MANY}
    instance._relationName = ['cate'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance._getHasManyRelation = function(data, opts, options){
      assert.deepEqual(data, [ { name: 1 } ]);
      delete opts.model;
      assert.deepEqual(opts, {"name":"cate","type":think.model.HAS_MANY,"key":"id","fKey":"user_id","relation":true})
      return Promise.resolve();
    }
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('getRelation, MANY_TO_MANY, _relationName contain', function(done){
    var instance = new Relation('user', think.config('db'));
    instance.relation = {cate: think.model.MANY_TO_MANY}
    instance._relationName = ['cate'];
    instance.getSchema = function(){
      return Promise.resolve();
    }
    instance._getManyToManyRelation = function(data, opts, options){
      assert.deepEqual(data, [ { name: 1 } ]);
      delete opts.model;
      assert.deepEqual(opts, {"name":"cate","type":think.model.MANY_TO_MANY,"key":"id","fKey":"user_id","relation":true})
      return Promise.resolve();
    }
    instance.getRelation([{name: 1}], {}).then(function(data){
      assert.deepEqual(data, [{name: 1}])
      done();
    });
  })
  it('_postBelongsToRelation', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance._postBelongsToRelation([]);
    assert.deepEqual(data, [])
  })
  it('parseRelationWhere object', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationWhere({id: 10, name: 'thinkjs'}, {fKey: 'user_id', key: 'id'});
    assert.deepEqual(data, { user_id: 10 })
  })
  it('parseRelationWhere array', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationWhere([{id: 10, name: 'thinkjs'}, {id: 11}], {fKey: 'user_id', key: 'id'});
    assert.deepEqual(data, { user_id: ['IN', ['10', '11']] } )
  })
  it('parseRelationData, empty', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationData({id: 10, name: 'thinkjs'}, [], {fKey: 'user_id', key: 'id', name: 'cate'});
    assert.deepEqual(data, { id: 10, name: 'thinkjs', cate: {} })
  })
  it('parseRelationData, empty, array', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationData({id: 10, name: 'thinkjs'}, [], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
    assert.deepEqual(data, { id: 10, name: 'thinkjs', cate: [] })
  })
  it('parseRelationData, array, empty', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
    assert.deepEqual(data, [ { id: 10, name: 'thinkjs', cate: [] } ])
  })
  it('parseRelationData, array', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [{
      user_id: 10,
      title: 'title'
    }], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
    assert.deepEqual(data, [{"id":10,"name":"thinkjs","cate":[{"user_id":10,"title":"title"}]}])
  })
  it('parseRelationData, array 1', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [{
      user_id: 10,
      title: 'title'
    }, {
      user_id: 11,
      title: 'title1'
    }], {fKey: 'user_id', key: 'id', name: 'cate'}, true);
    assert.deepEqual(data, [{"id":10,"name":"thinkjs","cate":[{"user_id":10,"title":"title"}]}])
  })
  it('parseRelationData, array 2', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationData([{id: 10, name: 'thinkjs'}], [{
      user_id: 10,
      title: 'title'
    }, {
      user_id: 11,
      title: 'title1'
    }], {fKey: 'user_id', key: 'id', name: 'cate'});
    assert.deepEqual(data, [{"id":10,"name":"thinkjs","cate":{"user_id":10,"title":"title"}}])
  })
  it('parseRelationData, (issue-417)', function(){
    var instance = new Relation('user', think.config('db'));
    var data = instance.parseRelationData([{id: 10, cate: 10, name: 'thinkjs'}], [{
      user_id: 10,
      title: 'title'
    }, {
      user_id: 11,
      title: 'title1'
    }], {fKey: 'user_id', key: 'cate', name: 'cate'});
    assert.deepEqual(data, [{"id":10,"name":"thinkjs","cate":{"user_id":10,"title":"title"}}])
  })
  it('afterAdd', function(){
    var instance = new Relation('user', think.config('db'));
    instance.postRelation = function(type){
      assert.equal(type, 'ADD')
    }
    instance.afterAdd();
  })
  it('afterDelete', function(){
    var instance = new Relation('user', think.config('db'));
    instance.postRelation = function(type){
      assert.equal(type, 'DELETE')
    }
    instance.afterDelete({});
  })
  it('afterUpdate', function(){
    var instance = new Relation('user', think.config('db'));
    instance.postRelation = function(type){
      assert.equal(type, 'UPDATE')
    }
    instance.afterUpdate();
  })
  it('getRelationTableName', function(){
    var instance = new Relation('post', think.config('db'));
    instance.tablePrefix = 'think_';
    var model = new Relation('cate', think.config('db'));
    model.tablePrefix = 'think_';
    var table = instance.getRelationTableName(model);
    assert.equal(table, 'think_post_cate')
  })
  it('getRelationModel', function(){
    var instance = new Relation('post', think.config('db'));
    var model = new Relation('cate', think.config('db'));
    var model1 = instance.getRelationModel(model);
    assert.equal(model1.name, 'post_cate')
  })
  it('_getHasOneRelation', function(done){
    var instance = new Relation('post', think.config('db'));
    var model = new Relation('detail', think.config('db'));
    model.select = function(){
      return [{post: 10, content: 'detail1'}]
    }
    var data = {id: 10, title: 'post1'}
    instance._getHasOneRelation(data, {
      name: 'detail',
      model: model
    }).then(function(data){
      assert.deepEqual(data, {"id":10,"title":"post1","detail":{"post":10,"content":"detail1"}})
      done();
    })
  })
  it('_getBelongsToRelation', function(done){
    var instance = new Relation('detail', think.config('db'));
    var model = new Relation('post', think.config('db'));
    model.getPk = function(){
      return 'id';
    }
    model.select = function(){
      return [{id: 10, content: 'detail1'}]
    }
    var data = {post_id: 10, title: 'post1'}
    instance._getBelongsToRelation(data, {
      name: 'post',
      model: model
    }).then(function(data){
      //console.log(JSON.stringify(data))
      assert.deepEqual(data, {"post_id":10,"title":"post1","post":{"id":10,"content":"detail1"}})
      done();
    })
  })
  it('_getHasManyRelation', function(done){
    var instance = new Relation('post', think.config('db'));
    var model = new Relation('detail', think.config('db'));
    model.select = function(){
      return [{post: 10, content: 'detail1'}]
    }
    var data = {id: 10, title: 'post1'}
    instance._getHasManyRelation(data, {
      name: 'detail',
      model: model
    }).then(function(data){
      assert.deepEqual(data, {"id":10,"title":"post1","detail":[{"post":10,"content":"detail1"}]})
      done();
    })
  });
  it('_getManyToManyRelation', function(done){
    var instance = new Relation('post', think.config('db'));
    instance.tablePrefix = 'think_';
    var model = new Relation('cate', think.config('db'));
    model.tablePrefix = 'think_';
    model.getPk = function(){
      return 'id';
    };
    var DbMysql = think.adapter('db', 'mysql');
    muk(DbMysql.prototype, 'select', function(sql, cache){
      assert.equal(sql.trim(), 'SELECT b.*, a.cate_id FROM think_post_cate as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id');
      return [{
        post_id: 10,
        cate_id: 1,
        name: 'cate1'
      }]
    });
    var data = {id: 10, title: 'post1'}
    instance._getManyToManyRelation(data, {
      name: 'cate',
      key: 'id',
      fKey: 'cate_id',
      model: model
    }, {}).then(function(data){
      //console.log(JSON.stringify(data))
      assert.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]})
      muk.restore();
      done();
    }).catch(function(err){ done(err) })
  })
  it('_getManyToManyRelation, has table name', function(done){
    var instance = new Relation('post', think.config('db'));
    instance.tablePrefix = 'think_';
    var model = new Relation('cate', think.config('db'));
    model.tablePrefix = 'think_';
    model.getPk = function(){
      return 'id';
    };
    var DbMysql = think.adapter('db', 'mysql');
    muk(DbMysql.prototype, 'select', function(sql, cache){
      assert.equal(sql.trim(), 'SELECT b.*, a.cate_id FROM think_p_c as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id');
      return [{
        post_id: 10,
        cate_id: 1,
        name: 'cate1'
      }]
    });
    var data = {id: 10, title: 'post1'};
    instance._getManyToManyRelation(data, {
      name: 'cate',
      key: 'id',
      fKey: 'cate_id',
      model: model,
      rModel: 'p_c'
    }, {}).then(function(data){
      //console.log(JSON.stringify(data))
      assert.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]})
      muk.restore();
      done();
    }).catch(function(err){ done(err) })
  });
  it('_getManyToManyRelation, has table name & prefix', function(done){
    var instance = new Relation('post', think.config('db'));
    instance.tablePrefix = 'think_';
    var model = new Relation('cate', think.config('db'));
    model.tablePrefix = 'think_';
    model.getPk = function(){
      return 'id';
    };
    var DbMysql = think.adapter('db', 'mysql');
    muk(DbMysql.prototype, 'select', function(sql, cache){
      assert.equal(sql.trim(), 'SELECT b.*, a.cate_id FROM think_p_c as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id');
      return [{
        post_id: 10,
        cate_id: 1,
        name: 'cate1'
      }]
    });
    var data = {id: 10, title: 'post1'};
    instance._getManyToManyRelation(data, {
      name: 'cate',
      key: 'id',
      fKey: 'cate_id',
      model: model,
      rModel: 'think_p_c'
    }, {}).then(function(data){
      //console.log(JSON.stringify(data))
      assert.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]})
      done();
      muk.restore();
    }).catch(function(err){ done(err) })
  });
  it('_getManyToManyRelation, has where', function(done){
    var instance = new Relation('post', think.config('db'));
    instance.tablePrefix = 'think_';
    var model = new Relation('cate', think.config('db'));
    model.tablePrefix = 'think_';
    model.getPk = function(){
      return 'id';
    };
    var DbMysql = think.adapter('db', 'mysql');
    muk(DbMysql.prototype, 'select', function(sql, cache){
      assert.equal(sql.trim(), 'SELECT b.*, a.cate_id FROM think_p_c as a, think_cate as b  WHERE ( `cate_id` = 10 ) AND a.cate_id=b.id  AND name=1');
      return [{
        post_id: 10,
        cate_id: 1,
        name: 'cate1'
      }]
    });
    var data = {id: 10, title: 'post1'};
    instance._getManyToManyRelation(data, {
      name: 'cate',
      key: 'id',
      fKey: 'cate_id',
      model: model,
      rModel: 'p_c',
      where: 'name=1'
    }, {}).then(function(data){
      //console.log(JSON.stringify(data))
      assert.deepEqual(data, {"id":10,"title":"post1","cate":[{"post_id":10,"cate_id":1,"name":"cate1"}]})
      done();
      muk.restore();
    }).catch(function(err){ done(err) })
  });
});