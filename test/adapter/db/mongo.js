'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var Mongo = require('../../../lib/adapter/db/mongo.js');

describe('adapter/db/mongo', function(){
  it('get instance', function(){
    var instance = new Mongo({});
    assert.deepEqual(instance.config, {});
    assert.equal(instance.lastInsertId, 0);
    assert.equal(instance._socket, null);
  })
  it('get socket instance', function(){
    var instance = new Mongo({});
    var socket = instance.socket();
    assert.deepEqual(socket.config, { host: '127.0.0.1', port: 27017 });
    var socket2 = instance.socket();
    assert.equal(socket, socket2);
    assert.equal(instance._socket, socket);
  })
  it('get last insert id', function(){
    var instance = new Mongo({});
    var id = instance.getLastInsertId();
    assert.equal(id, 0)
  })
  it('collection', function(done){
    var instance = new Mongo({});
    instance.socket = function(){
      return {
        getConnection: function(){
          return Promise.resolve({
            collection: function(table){
              assert.equal(table, 'test');
              return table;
            }
          })
        }
      }
    }
    instance.collection('test').then(function(data){
      assert.equal(data, 'test');
      done();
    })
  })
  it('add', function(done){
    var instance = new Mongo({});
    instance.collection = function(table){
      return {
        insert: function(data){
          data._id = 1111;
          return {name: 'test'};
        }
      }
    }
    instance.add({name: 'welefen'}, {table: 'test'}).then(function(data){
      var id = instance.getLastInsertId();
      assert.equal(id, 1111)
      done();
    })
  })
  it('addMany', function(done){
    var instance = new Mongo({});
    instance.collection = function(table){
      return {
        insert: function(data){
          data[0]._id = 1111;
          return {name: 'test'};
        }
      }
    }
    instance.addMany([{name: 'welefen'}], {table: 'test'}).then(function(data){
      var ids = instance.getLastInsertId();
      assert.deepEqual(ids, [1111])
      done();
    })
  })
  it('limit', function(done){
    var instance = new Mongo({});
    instance.limit({
      limit: function(data){
        assert.equal(data, 10);
        done();
      }
    }, 10);
  })
  it('limit, with skip', function(done){
    var instance = new Mongo({});
    instance.limit({
      skip: function(data){
        assert.equal(data, 10);
      },
      limit: function(data){
        assert.equal(data, 10);
        done();
      }
    }, [10, 10]);
  })
  it('limit, with skip', function(done){
    var instance = new Mongo({});
    instance.limit({
      skip: function(data){
        assert.equal(data, 0);
      },
      limit: function(data){
        assert.equal(data, 10);
        done();
      }
    }, [10, 0]);
  })
  it('group empty', function(){
    var instance = new Mongo({});
    var data = instance.group();
    assert.deepEqual(data, {_id: null});
  })
  it('group string', function(){
    var instance = new Mongo({});
    var data = instance.group('name');
    assert.deepEqual(data, {_id: '$name'});
  })
  it('group multi string', function(){
    var instance = new Mongo({});
    var data = instance.group('name, value');
    assert.deepEqual(data, {name: '$name', value: '$value'});
  })
  it('select', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        find: function(where, fields){
          assert.deepEqual(where, {});
          assert.deepEqual(fields, {})
          return instance.collection();
        },
        sort: function(){
          return instance.collection();
        },
        toArray: function(){
          return [{name: 'test'}]
        }
      }
    }
    instance.select({
      table: 'test',
    }).then(function(data){
      assert.deepEqual(data, [{name: 'test'}]);
      done();
    }).catch(function(err){
      console.log(err);
    })
  })
  it('select, distinct', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        find: function(where, fields){
          assert.deepEqual(where, {});
          assert.deepEqual(fields, {})
          return instance.collection();
        },
        distinct: function(){
          return [{name: 'test'}];
        },
        sort: function(){
          return instance.collection();
        },
        toArray: function(){
          return [{name: 'test'}]
        }
      }
    }
    instance.select({
      table: 'test',
      distinct: 'name'
    }).then(function(data){
      assert.deepEqual(data, [{name: 'test'}]);
      done();
    }).catch(function(err){
      console.log(err);
    })
  })
  it('update', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        update: function(where, data, options){
          assert.deepEqual(options, { table: 'test', multi: true, upsert: false })
          done();
        }
      }
    }
    instance.update({name: 'test'}, {
      table: 'test'
    })
  })
  it('update 1', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        update: function(where, data, options){
          //console.log(options)
          assert.deepEqual(options, { table: 'test', limit: 1, upsert: true })
          done();
        }
      }
    }
    instance.update({name: 'test'}, {
      table: 'test',
      limit: 1,
      upsert: true
    })
  })
  it('update 2', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        update: function(where, data, options){
          //console.log(options)
          assert.deepEqual(options, { table: 'test', limit: 1, upsert: true })
          done();
        }
      }
    }
    instance.update({$set: {name: 'test'}}, {
      table: 'test',
      limit: 1,
      upsert: true
    })
  })
  it('delete', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        remove: function(where, options){
          assert.deepEqual(where, {});
          assert.deepEqual(options, {});
          done();
        }
      }
    }
    instance.delete({
      table: 'test'
    })
  })
  it('delete 1', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        remove: function(where, options){
          assert.deepEqual(where, {});
          assert.deepEqual(options, {justOne: true});
          done();
        }
      }
    }
    instance.delete({
      table: 'test',
      limit: 1
    })
  })
  it('count', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        aggregate: function(data, callback){
          assert.deepEqual(data, [{"$group":{"_id":null,"total":{"$sum":1}}}])
          done();
        }
      }
    }
    instance.count({
      table: 'test'
    });
  })
  it('count 1', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        aggregate: function(data, callback){
          //console.log(JSON.stringify(data))
          assert.deepEqual(data, [{"$match":{"name":"test"}},{"$group":{"_id":null,"total":{"$sum":1}}},{"$sort":{"name":1}}])
          done();
        }
      }
    }
    instance.count({
      table: 'test',
      where: {name: 'test'},
      order: 'name'
    });
  })
  it('count 2', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        aggregate: function(data, callback){
          //console.log(JSON.stringify(data))
          assert.deepEqual(data, [{"$match":{"name":"test"}},{"$group":{"_id":null,"total":{"$sum":1}}},{"$sort":{"name":1}}])
          callback && callback(null, [{total: 100}])
        }
      }
    }
    instance.count({
      table: 'test',
      where: {name: 'test'},
      order: 'name'
    }).then(function(data){
      assert.equal(data, 100);
      done();
    });
  })
  it('sum', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        aggregate: function(data, callback){
          //console.log(JSON.stringify(data))
          assert.deepEqual(data, [{"$group":{"_id":null,"total":{"$sum":"$name"}}}])
          done();
        }
      }
    }
    instance.sum({
      table: 'test',
      field: 'name'
    });
  })
  it('sum 1', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        aggregate: function(data, callback){
          //console.log(JSON.stringify(data))
          assert.deepEqual(data, [{"$match":{"name":"test"}},{"$group":{"_id":null,"total":{"$sum":"$name"}}},{"$sort":{"name":1}}])
          done();
        }
      }
    }
    instance.sum({
      table: 'test',
      where: {name: 'test'},
      field: 'name', 
      order: 'name'
    });
  })
  it('sum 2', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return {
        aggregate: function(data, callback){
          //console.log(JSON.stringify(data))
          assert.deepEqual(data, [{"$match":{"name":"test"}},{"$group":{"_id":null,"total":{"$sum":"$name"}}},{"$sort":{"name":1}}])
          callback && callback(null, [{total: 100}])
        }
      }
    }
    instance.sum({
      table: 'test',
      where: {name: 'test'},
      order: 'name',
      field: 'name'
    }).then(function(data){
      assert.equal(data, 100);
      done();
    });
  })
  it('ensureIndex', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return Promise.resolve({
        ensureIndex: function(indexes, options){
          assert.deepEqual(indexes, {})
          done();
        }
      })
    }
    instance.ensureIndex('test', {});
  })
  it('ensureIndex, unique', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return Promise.resolve({
        ensureIndex: function(indexes, options){
          assert.deepEqual(options, {unique: true})
          done();
        }
      })
    }
    instance.ensureIndex('test', {}, true);
  })
  it('ensureIndex, string', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return Promise.resolve({
        ensureIndex: function(indexes, options){
          assert.deepEqual(indexes, {name: 1})
          assert.deepEqual(options, {unique: true})
          done();
        }
      })
    }
    instance.ensureIndex('test', 'name', true);
  })
  it('aggregate', function(done){
    var instance = new Mongo({});
    instance.collection = function(){
      return Promise.resolve({
        aggregate: function(options){
          assert.deepEqual(options, {});
          done();
        }
      })
    }
    instance.aggregate('test', {})
  })
  it('close', function(done){
    var instance = new Mongo({});
    instance.close();
    instance._socket = {
      close: function(){
        done();
      }
    }
    instance.close();
  })
})