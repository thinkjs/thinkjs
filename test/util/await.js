
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var Await = think.safeRequire(path.resolve(__dirname, '../../lib/util/await.js'));

describe('await', function(){
  it('is class', function(){
    assert.equal(think.isFunction(Await), true)
  })
  it('instace.queue is object', function(){
    var instance = new Await();
    assert.equal(think.isObject(instance.queue), true)
  })
  it('run', function(done){
    var instance = new Await();
    instance.run('welefen', function(){
      var deferred = think.defer();
      setTimeout(function(){
        deferred.resolve(1);
      }, 3)
      return deferred.promise;
    }).then(function(data){
      assert.equal(data, 1);
      done();
    })
  })
  it('run many', function(done){
    var instance = new Await();
    var promises = [1, 2, 3].map(function(item){
      return instance.run('welefen', function(){
        var deferred = think.defer();
        setTimeout(function(){
          deferred.resolve(item);
        }, 2)
        return deferred.promise;
      }).then(function(data){
        assert.equal(data, 1);
      })
    })
    Promise.all(promises).then(function(){
      assert.deepEqual(instance.queue, {})
      done();
    });
  })
  it('run fail', function(done){
    var instance = new Await();
    var promises = [1, 2, 3].map(function(item){
      return instance.run('welefen', function(){
        var deferred = think.defer();
        setTimeout(function(){
          deferred.reject(item);
        }, 3)
        return deferred.promise;
      }).catch(function(data){
        assert.equal(data, 1);
      })
    })
    Promise.all(promises).then(function(){
      assert.deepEqual(instance.queue, {})
      done();
    });
  })
})