'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


for(var filepath in require.cache){
  delete require.cache[filepath];
}
var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var FileSession = think.adapter('session', 'file');

describe('adapter/session/file', function(){
  it('get instance', function(){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    assert.equal(instance.gcType, instance.path);
    assert.equal(instance.cookie, 'welefen');
  })
  it('get instance, ingore path', function(){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen', path: ''}));
    assert.equal(instance.gcType, instance.path);
    assert.equal(instance.cookie, 'welefen');
    assert.equal(instance.path.indexOf(path.sep + 'thinkjs') > -1, true)
  })
  it('get instance, ingore path 2', function(){
    var instance = new FileSession(think.extend({}, {cookie: 'welefen', path: ''}));
    assert.equal(instance.gcType, instance.path);
    assert.equal(instance.cookie, 'welefen');
    //console.log(instance.path)
    assert.equal(instance.path.indexOf(path.sep + 'thinkjs') > -1, true)
  })
  it('get file path', function(){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    var filepath = instance.getFilepath();
    assert.equal(filepath, 'w' + think.sep +'welefen.json');
  })
  it('get data, undefined', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.get('welefen').then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('get data', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.set('welefen', 'suredy').then(function(){
      return instance.get('welefen')
    }).then(function(data){
      assert.equal(data, 'suredy');
      done();
    })
  })
  it('getData, empty', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.store = {
      get: function(){
        return Promise.resolve(JSON.stringify({
          expire: Date.now() + 10000
        }))
      }
    }
    return instance.getData().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('getData, empty 2', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.store = {
      get: function(){
        return Promise.resolve(JSON.stringify({
          expire: Date.now() + 10000
        }))
      }
    }
    instance.getData();
    return instance.getData().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('getData, error', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.store = {
      get: function(){
        return Promise.resolve('not json')
      }
    }
    return instance.getData().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('get data 1', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.set('welefen', 'suredy', 10).then(function(){
      return instance.get('welefen')
    }).then(function(data){
      assert.equal(data, 'suredy');
      assert.equal(instance.timeout, 10);
      done();
    })
  })
  it('get data deleted', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.set('welefen', 'suredy', 10).then(function(){
      return instance.delete('welefen');
    }).then(function(){
      return instance.get('welefen')
    }).then(function(data){
      assert.equal(data, undefined);
      assert.equal(instance.timeout, 10);
      done();
    })
  })
  it('get data delete all', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    instance.set('welefen', 'suredy', 10).then(function(){
      return instance.delete();
    }).then(function(){
      return instance.get('welefen')
    }).then(function(data){
      assert.equal(data, undefined);
      assert.equal(instance.timeout, 10);
      done();
    })
  })
  it('get data 2', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    var instance1 = new FileSession(think.extend({}, think.config('session'), {cookie: 'welefen'}));
    
    instance.set('welefen', 'suredy', 10).then(function(){
      return instance.flush();
    }).then(function(){
      return instance1.get('welefen')
    }).then(function(data){
      assert.equal(data, 'suredy');
      done();
    })
  })
  it('get data expired', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'wwww'}));
    var instance1 = new FileSession(think.extend({}, think.config('session'), {cookie: 'wwww'}));
    
    instance.set('welefen', 'suredy', 0.01).then(function(){
      return instance.flush();
    }).then(function(){
      setTimeout(function(){
        return instance1.get('welefen').then(function(data){
          assert.equal(data, undefined);
          done();
        })
      }, 40)
    })
  })
  
  it('get all data', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'fasdfasdf'}));
    instance.get().then(function(data){
      assert.deepEqual(data, {});
      done();
    })
  })
  it('gc', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'fasdfasdf'}));
    instance.set('welefen','suredy', 0.01).then(function(){
      return instance.flush();
    }).then(function(){
      setTimeout(function(){
        instance.gc().then(function(){
          done();
        })
      }, 40)
    })
  })
  it('gc, json error', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'fasdfasdf'}));
    instance.set('welefen','suredy', 0.01).then(function(){
      return instance.flush();
    }).then(function(){
      var filepath = instance.path + '/' + instance.getFilepath();
      fs.writeFileSync(filepath, 'not json')
      setTimeout(function(){
        instance.gc().then(function(){
          setTimeout(function(){
            assert.equal(think.isFile(filepath), false);
            done();
          }, 20)
          //done();
        })
      }, 40)
    })
  })
  it('remove files', function(done){
    var instance = new FileSession(think.extend({}, think.config('session'), {cookie: 'fasdfasdf'}));
    think.rmdir(instance.path).then(done);
  })
})

