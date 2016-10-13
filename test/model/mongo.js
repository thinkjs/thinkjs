'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var Mongo = think.safeRequire(path.resolve(__dirname, '../../lib/model/mongo.js'));


describe('model/mongo.js', function(){
  it('init', function(){
    var instance = new Mongo('user', think.config('db'));
    assert.equal(instance.name, 'user')
  })
  it('getPk', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.getPk().then(function(data){
      assert.equal(data, '_id');
      done();
    })
  })
  it('_createIndexes, empty', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.indexes = {};
    var flag = false;
    instance.createIndex = function(value, options){
      flag = true;
    }
    instance._createIndexes().then(function(data){
      assert.equal(flag, false);
      done();
    })
  })
  it('_createIndexes, single', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.indexes = {name: 1}
    instance.createIndex = function(value, options){
      assert.deepEqual(value, { name: 1 });
      assert.deepEqual(options, undefined);
    }
    instance._createIndexes().then(function(data){
      done();
    })
  })
  it('_createIndexes, single, unique', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.indexes = {name: {$unique: 1}};
    instance.createIndex = function(value, options){
      assert.deepEqual(value, { name: 1 });
      assert.deepEqual(options, { unique: 1 });
    }
    var key = 'mongo_' + instance.getTableName() + '_indexes';
    thinkCache(thinkCache.TABLE, key, null);
    instance._createIndexes().then(function(data){
      done();
    })
  })
  it('_createIndexes, multi, unique', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.indexes = {name: {name:1, title: 1, $unique: 1}};
    instance.createIndex = function(value, options){
      assert.deepEqual(value, { name: 1, title: 1 });
      assert.deepEqual(options, { unique: 1 });
    }
    var key = 'mongo_' + instance.getTableName() + '_indexes';
    thinkCache(thinkCache.TABLE, key, null);
    instance._createIndexes().then(function(data){
      done();
    })
  })
  it('_createIndexes, multi, unique 2', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.indexes = {name: {name:1, title: 1, $unique: 1}};
    var flag = false;
    instance.createIndex = function(value, options){
      flag = true;
    }
    instance._createIndexes().then(function(data){
      assert.equal(flag, false);
      done();
    })
  })
  it('parseOptions, emtpy', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(value, options){};
    instance.parseOptions().then(function(options){
      assert.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user' })
      done();
    })
  });
  it('parseOptions, object', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(value, options){}
    instance.parseOptions({test: 1}).then(function(options){
      assert.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user', test: 1 })
      done();
    })
  });
  it('parseData', function(){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    var data = instance.parseData('thinkjs');
    assert.equal(data, 'thinkjs')
  });
  it('collection', function(){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.db = function(){
      return {
        collection: function(table){
          assert.equal(table, 'think_user')
        }
      }
    };
    instance.collection();
  });
  it('add, data empty', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.add().catch(function(err){
      done();
    })
  });
  it('add', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        add: function(data, options){
          assert.deepEqual(data, {name: 1});
          assert.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user' })
        },
        getLastInsertId: function(){
          return 111;
        }
      }
    };
    instance.add({name: 1}).then(function(data){
      assert.equal(data, 111);
      done();
    })
  });
  it('thenAdd, exist', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.find = function(){
      return {
        id: 100,
        name: 1
      }
    };
    instance.thenAdd({name: 1, value: 1}, {name: 1}).then(function(data){
      assert.deepEqual(data, { id: 100, type: 'exist' });
      done();
    })
  });
  it('thenAdd, exist', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.find = function(){
      return {};
    };
    instance.add = function(){
      return 111;
    };
    instance.thenAdd({name: 1, value: 1}, {name: 1}).then(function(data){
      assert.deepEqual(data, { id: 111, type: 'add' });
      done();
    })
  });
  it('addMany, data is not array', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.addMany({name: 1, value: 1}).catch(function(err){
      done();
    })
  });
  it('addMany, data item is not object', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance.addMany(['thinkjs']).catch(function(err){
      done();
    })
  });
  it('addMany', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        addMany: function(data, options){
          assert.deepEqual(data, [ { name: 'thinkjs' } ]);
          assert.deepEqual(options, { table: 'think_user', tablePrefix: 'think_', model: 'user' })
        },
        getLastInsertId: function(){
          return 111;
        }
      }
    };
    instance.addMany([{name: 'thinkjs'}]).then(function(id){
      assert.equal(id, 111);
      done();
    })
  });
  it('delete', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        delete: function(options){
          assert.deepEqual(options, { where: { id: 1 },table: 'think_user',tablePrefix: 'think_',model: 'user' })
          return {
            result: {
              n: 10
            }
          }
        }
      }
    };
    instance.where({id: 1}).delete().then(function(rows){
      assert.equal(rows, 10);
      done();
    })
  });
  it('delete, no default', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        delete: function(options){
          assert.deepEqual(options, { where: { id: 1 },table: 'think_user',tablePrefix: 'think_',model: 'user' })
          return {
            result: {
              n: 0
            }
          }
        }
      }
    };
    instance.where({id: 1}).delete().then(function(rows){
      assert.equal(rows, 0);
      done();
    })
  });
  it('update, rows 0', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        update: function(data, options){
          assert.deepEqual(data, { name: 'thinkjs' });
          return {
            result: {

            }
          }
        }
      }
    };
    instance.where({id: 1}).update({name: 'thinkjs'}).then(function(rows){
      assert.equal(rows, 0);
      done();
    })
  });
  it('update, rows 0', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        update: function(data, options){
          assert.deepEqual(data, { name: 'thinkjs' });
          return {
            result: {
              nModified: 100
            }
          }
        }
      }
    };
    instance.update({name: 'thinkjs', _id: '100'}).then(function(rows){
      assert.equal(rows, 100);
      done();
    })
  });
  it('updateMany, not array', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.updateMany({name: 'thinkjs', _id: '100'}).catch(function(err){
      done();
    })
  });
  it('updateMany, not array', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.update = function(){
      return 10;
    };
    instance.updateMany([{name: 'thinkjs', _id: '100'}, {name: 'welefen'}]).then(function(rows){
      assert.equal(rows, 20);
      done();
    })
  });
  it('select', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        select: function(){
          return [{name: 'thinkjs'}]
        }
      }
    };
    instance.select().then(function(data){
      assert.deepEqual(data, [{name: 'thinkjs'}]);
      done();
    })
  });
  it('countSelect', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.count = function(){
      return 111;
    }
    instance.select = function(){
      return [{name: 'thinkjs'}]
    }
    instance.countSelect().then(function(data){
      assert.deepEqual(data, { count: 111,totalPages: 12,numsPerPage: 10,currentPage: 1,data: [ { name: 'thinkjs' } ] })
      done();
    })
  })
  it('countSelect, true', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.count = function(){
      return 111;
    }
    instance.select = function(){
      return [{name: 'thinkjs'}]
    }
    instance.countSelect(true).then(function(data){
      assert.deepEqual(data, { count: 111,totalPages: 12,numsPerPage: 10,currentPage: 1,data: [ { name: 'thinkjs' } ] })
      done();
    })
  })
  it('countSelect, has count', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.count = function(){
      return 111;
    }
    instance.select = function(){
      return [{name: 'thinkjs'}]
    }
    instance.countSelect(55).then(function(data){
      assert.deepEqual(data, {"count":55,"totalPages":6,"numsPerPage":10,"currentPage":1,"data":[{"name":"thinkjs"}]})
      done();
    })
  })
  it('countSelect, page overflow, true', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.count = function(){
      return 111;
    }
    instance.select = function(){
      return [{name: 'thinkjs'}]
    }
    instance.page(100).countSelect(true).then(function(data){
      assert.deepEqual(data, {"count":111,"totalPages":12,"numsPerPage":10,"currentPage":1,"data":[{"name":"thinkjs"}]})
      done();
    })
  })
  it('countSelect, page overflow, false', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.count = function(){
      return 111;
    }
    instance.select = function(){
      return [{name: 'thinkjs'}]
    }
    instance.page(100).countSelect(false).then(function(data){
      assert.deepEqual(data, {"count":111,"totalPages":12,"numsPerPage":10,"currentPage":12,"data":[{"name":"thinkjs"}]})
      done();
    })
  })
  it('countSelect, chagne nums in page', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.count = function(){
      return 111;
    }
    instance.select = function(){
      return [{name: 'thinkjs'}]
    }
    instance.page(10, 3).countSelect(false).then(function(data){
      assert.deepEqual(data, {"count":111,"totalPages":37,"numsPerPage":3,"currentPage":10,"data":[{"name":"thinkjs"}]})
      done();
    })
  })
  it('find', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        select: function(){
          return [{name: 'thinkjs'}];
        }
      }
    }
    instance.page(10, 3).find().then(function(data){
      assert.deepEqual(data, { name: 'thinkjs' })
      done();
    })
  })
  it('find, default value', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        select: function(){
          return [false, {name: 'thinkjs'}];
        }
      }
    }
    instance.page(10, 3).find().then(function(data){
      assert.deepEqual(data, {})
      done();
    })
  })
  it('increment', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        update: function(data, options){
          assert.deepEqual(data, { '$inc': { name: 1 } })
          return Promise.resolve({
            result: {n: 10}
          })
        }
      }
    }
    instance.increment('name').then(function(data){
      done();
    })
  })
  it('increment, 10', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        update: function(data, options){
          assert.deepEqual(data, { '$inc': { name: 10 } })
          return Promise.resolve({
            result: {n: 10}
          })
        }
      }
    }
    instance.increment('name', 10).then(function(data){
      done();
    })
  })
  it('decrement', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        update: function(data, options){
          assert.deepEqual(data, { '$inc': { name: -1 } })
          return Promise.resolve({
            result: {n: 10}
          })
        }
      }
    }
    instance.decrement('name').then(function(data){
      done();
    })
  })
  it('decrement, 10', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        update: function(data, options){
          assert.deepEqual(data, { '$inc': { name: -10 } })
          return Promise.resolve({
            result: {n: 10}
          })
        }
      }
    };
    instance.decrement('name', 10).then(function(data){
      done();
    })
  });
  it('count', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){}
    instance.db = function(){
      return {
        count: function(options){
          assert.deepEqual(options, {"field":["name"],"fieldReverse":false,"table":"think_user","tablePrefix":"think_","model":"user"})
        }
      }
    };
    instance.count('name').then(function(data){
      done();
    })
  });
  it('sum', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        sum: function(options){
          assert.deepEqual(options, {"field":["name"],"fieldReverse":false,"table":"think_user","tablePrefix":"think_","model":"user"})
        }
      }
    };
    instance.sum('name').then(function(data){
      done();
    })
  });
  it('aggregate', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        aggregate: function(table, options){
          assert.equal(table, 'think_user');
          return Promise.resolve();
        }
      }
    };
    instance.aggregate().then(function(data){
      done();
    })
  });
  it('mapReduce', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.collection = function(){
      return Promise.resolve({
        mapReduce: function(fn){
          assert.equal(think.isFunction(fn), true)
        }
      })
    };
    instance.mapReduce(function(){}).then(function(data){
      done();
    })
  });
  it('createIndex', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.db = function(){
      return {
        ensureIndex: function(table, indexes){
          assert.equal(table, 'think_user');
          assert.deepEqual(indexes, {});
          return Promise.resolve();
        }
      }
    };
    instance.createIndex({}).then(function(data){
      done();
    })
  });
  it('getIndexes', function(done){
    var instance = new Mongo('user', think.config('db'));
    instance.tablePrefix = 'think_';
    instance._createIndexes = function(){};
    instance.collection = function(){
      return Promise.resolve({
        indexes: function(){
          return Promise.resolve([{}])
        }
      })
    };
    instance.getIndexes({}).then(function(data){
      assert.deepEqual(data, [{}]);
      done();
    })
  })


});