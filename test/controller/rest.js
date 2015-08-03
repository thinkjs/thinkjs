var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

for(var filepath in require.cache){
  delete require.cache[filepath];
}
var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();


think.APP_PATH = path.dirname(__dirname) + '/testApp';


var _http = require('../_http.js');

function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + '/testApp';
  var req = think.extend({}, _http.req);
  var res = think.extend({}, _http.res);
  return think.http(req, res).then(function(http){
    if(config){
      http._config = config;
    }
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return http;
  })
}
var RestController = require('../../lib/controller/rest.js');

function getInstance(options){
  return getHttp().then(function(http){
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return new RestController(http);
  })
}


describe('controller/rest.js', function(){
  it('get instance', function(done){
    getInstance().then(function(instance){
      assert.equal(instance.__isRest, true);
      assert.equal(instance.resource, 'rest');
      assert.equal(instance.id, 'welefen')
      done();
    })
  })
  it('get instance, has id', function(done){
    getInstance({
      _get: {
        id: 'test'
      }
    }).then(function(instance){
      assert.equal(instance.__isRest, true);
      assert.equal(instance.resource, 'rest');
      assert.equal(instance.id, 'test')
      done();
    })
  })
  it('get instance, no id', function(done){
    getInstance({
      pathname: 'rest'
    }).then(function(instance){
      assert.equal(instance.__isRest, true);
      assert.equal(instance.resource, 'rest');
      assert.equal(instance.id, '')
      done();
    })
  })
  it('getAction, no id', function(done){
    getInstance({
      pathname: 'rest'
    }).then(function(instance){
      instance.modelInstance.select = function(){
        return ['select data'];
      }
      instance.success = function(data){
        return data;
      }
      instance.getAction().then(function(data){
        assert.deepEqual(data, ['select data']);
        done();
      })
    })
  })
  it('getAction, has id', function(done){
    getInstance({
      _get: {
        id: 10000
      }
    }).then(function(instance){
      instance.modelInstance.find = function(){
        assert.deepEqual(instance.modelInstance._options, { where: { id: 10000 } });
        return {
          name: 'test'
        }
      }
      instance.modelInstance.getPk = function(){
        return 'id';
      }
      instance.success = function(data){
        return data;
      }
      instance.getAction().then(function(data){
        assert.deepEqual(data, {name: 'test'});
        done();
      })
    })
  })
  it('postAction, no data', function(done){
    getInstance({
      pathname: 'rest',
      _post: {}
    }).then(function(instance){
      instance.modelInstance.getPk = function(){
        return 'id';
      }
      instance.fail = function(data){
        return data;
      }
      instance.postAction().then(function(data){
        assert.deepEqual(data, 'data is empty');
        done();
      })
    })
  })
  it('postAction, has data', function(done){
    getInstance({
      pathname: 'rest',
      _post: {
        name: 'test',
        value: 'value1'
      }
    }).then(function(instance){
      instance.modelInstance.getPk = function(){
        return 'id';
      }
      instance.modelInstance.add = function(data){
        assert.deepEqual(data, { name: 'test', value: 'value1' })
        return 10000;
      }
      instance.success = function(data){
        return data;
      }
      instance.postAction().then(function(data){
        assert.deepEqual(data, {id: 10000});
        done();
      })
    })
  })
  it('deleteAction, no id', function(done){
    getInstance({
      pathname: 'rest'
    }).then(function(instance){
      instance.fail = function(data){
        return data;
      }
      instance.deleteAction().then(function(data){
        assert.deepEqual(data, 'params error');
        done();
      })
    })
  })
  it('deleteAction, has id', function(done){
    getInstance({
      pathname: 'rest',
      _get: {
        id: 100002
      }
    }).then(function(instance){
      instance.modelInstance.getPk = function(){
        return 'id';
      }
      instance.modelInstance.delete = function(){
        var options = instance.modelInstance._options;
        assert.deepEqual(options, { where: { id: 100002 } })
        return 1;
      }
      instance.success = function(data){
        return data;
      }
      instance.deleteAction().then(function(data){
        assert.deepEqual(data, {affectedRows: 1});
        done();
      })
    })
  })
  it('putAction, no id', function(done){
    getInstance({
      pathname: 'rest'
    }).then(function(instance){
      instance.fail = function(data){
        return data;
      }
      instance.putAction().then(function(data){
        assert.deepEqual(data, 'params error');
        done();
      })
    })
  })
  it('putAction, has id, data empty', function(done){
    getInstance({
      pathname: 'rest',
      _get: {
        id: 100002
      },
      _post: {}
    }).then(function(instance){
      instance.modelInstance.getPk = function(){
        return 'id';
      }
      instance.fail = function(data){
        return data;
      }
      instance.putAction().then(function(data){
        assert.deepEqual(data, 'data is empty');
        done();
      })
    })
  })
  it('putAction, has id & data', function(done){
    getInstance({
      pathname: 'rest',
      _get: {
        id: 100002
      },
      _post: {
        name: 'test',
        value: 'dddd'
      }
    }).then(function(instance){
      instance.modelInstance.getPk = function(){
        return 'id';
      }
      instance.success = function(data){
        return data;
      }
      instance.modelInstance.update = function(data){
        var options = instance.modelInstance._options;
        assert.deepEqual(data, { name: 'test', value: 'dddd' })
        assert.deepEqual(options, { where: { id: 100002 } })
        return 1;
      }
      instance.putAction().then(function(data){
        assert.deepEqual(data, {affectedRows: 1});
        done();
      })
    })
  })
  it('__call', function(){
    getInstance({
      pathname: 'rest',
      _get: {
        id: 100002
      },
      _post: {
        name: 'test',
        value: 'dddd'
      }
    }).then(function(instance){
      instance.fail = function(msg){
        return msg;
      }
      var msg = instance.__call();
      assert.equal(msg.length > 0, true);
    })
  })
})