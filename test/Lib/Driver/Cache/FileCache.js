var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var net = require('net');
var fs = require('fs')

global.APP_PATH = path.normalize(__dirname + '/../../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../../www');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../../index.js'));

var FileCache = thinkRequire('FileCache');

describe('FileCache', function(){
  it('init', function(){
    var instance = FileCache();
    assert.equal(instance.gcType.indexOf('FileCache:'), 0)
    assert.equal(instance.options.cache_path_level, 2);
    assert.equal(instance.options.cache_file_suffix, '.json')
  })
  it('getStoredFile', function(){
    var instance = FileCache();
    var file = instance.getStoredFile('welefen');
    var f = instance.options.cache_path + '/d/0/d044be314c409f92c3ee66f1ed8d3753.json'
    assert.equal(file, f);
    var file = instance.getStoredFile('suredy');
    var f = instance.options.cache_path + '/3/b/3b89df11b06ad751bf2dac3d850ba66e.json'
    assert.equal(file, f);
  })
  it('getData undefined', function(done){
    var instance = FileCache();
    instance.getData('name1').then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('getData', function(done){
    var instance = FileCache();
    instance.setData('name2', 'welefen').then(function(){
      return instance.getData('name2')
    }).then(function(data){
      assert.deepEqual(data, {name2: 'welefen'})
      done();
    })
  })
  it('getData file content empty', function(done){
    var instance = FileCache();
    instance.setData('name3', 'welefen').then(function(){
      var filePath = instance.getStoredFile('name3')
      fs.writeFileSync(filePath, '');
      return instance.getData('name3')
    }).then(function(data){
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('getData data expired', function(done){
    var instance = FileCache();
    instance.setData('name4', 'welefen').then(function(){
      var filePath = instance.getStoredFile('name4')
      var content = fs.readFileSync(filePath, 'utf8');
      content = JSON.parse(content);
      content.expire -= 100000000000;
      fs.writeFileSync(filePath, JSON.stringify(content));
      return instance.getData('name4')
    }).then(function(data){
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('getData data not json', function(done){
    var instance = FileCache();
    instance.setData('name4', 'welefen').then(function(){
      var filePath = instance.getStoredFile('name4')
      var content = fs.readFileSync(filePath, 'utf8');
      content = JSON.parse(content);
      content.expire -= 100000000000;
      fs.writeFileSync(filePath, 'fasdf[www');
      return instance.getData('name4')
    }).then(function(data){
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('get', function(done){
    var instance = FileCache();
    instance.setData('name5', 'welefen').then(function(){
      return instance.get('name5')
    }).then(function(data){
      assert.deepEqual(data, 'welefen')
      done();
    })
  })
  it('get, data empty', function(done){
    var instance = FileCache();
    instance.setData('name5', 'welefen').then(function(){
      return instance.get('name6')
    }).then(function(data){
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('setData', function(done){
    var instance = FileCache();
    var now = Date.now;
    Date.now = function(){
      return 12121212121;
    }
    instance.setData('name6', 'welefen').then(function(){
      //assert.deepEqual(data, undefined)
      var filePath = instance.getStoredFile('name6');
      var content = fs.readFileSync(filePath, 'utf8');
      content = JSON.parse(content);
      assert.deepEqual(content, {"data":{"name6":"welefen"},"expire":12142812121,"timeout":21600})
      Date.now = now;
      done();
    })
  })
  it('setData with timeout', function(done){
    var instance = FileCache();
    var now = Date.now;
    Date.now = function(){
      return 12121212121;
    }
    instance.setData('name6', 'welefen', 20000).then(function(){
      var filePath = instance.getStoredFile('name6');
      var content = fs.readFileSync(filePath, 'utf8');
      content = JSON.parse(content);
      assert.deepEqual(content, {"data":{"name6":"welefen"},"expire":12141212121,"timeout":20000})
      Date.now = now;
      done();
    })
  })
  it('setData, name is object', function(done){
    var instance = FileCache();
    var now = Date.now;
    Date.now = function(){
      return 12121212121;
    }
    instance.setData({name8: 'welefen'}).then(function(){
      var filePath = instance.getStoredFile('name8');
      var content = fs.readFileSync(filePath, 'utf8');
      content = JSON.parse(content);
      assert.deepEqual(content, {"data":{"name8":"welefen"},"expire":12142812121,"timeout":21600})
      Date.now = now;
      done();
    })
  })
  it('setData, name is object1', function(done){
    var instance = FileCache();
    var now = Date.now;
    Date.now = function(){
      return 12121212121;
    }
    instance.setData({name8: 'welefen'}, 2220000).then(function(){
      var filePath = instance.getStoredFile('name8');
      var content = fs.readFileSync(filePath, 'utf8');
      //console.log(content)
      content = JSON.parse(content);
      assert.deepEqual(content, {"data":{"name8":"welefen"},"expire":14341212121,"timeout":2220000})
      Date.now = now;
      done();
    })
  })
  it('set, name is object1', function(done){
    var instance = FileCache();
    var now = Date.now;
    Date.now = function(){
      return 12121212121;
    }
    instance.set({name9: 'welefen'}, 2220000).then(function(){
      var filePath = instance.getStoredFile('name9');
      var content = fs.readFileSync(filePath, 'utf8');
      content = JSON.parse(content);
      assert.deepEqual(content, {"data":{"name9":"welefen"},"expire":14341212121,"timeout":2220000})
      Date.now = now;
      done();
    })
  })
  it('rm', function(done){
    var instance = FileCache();
    instance.rm('name').then(function(){
      done();
    })
  })
  it('rm exist file', function(done){
    var instance = FileCache();
    instance.set('name', 'welefen').then(function(){
      return instance.rm('name')
    }).then(function(){
      var filePath = instance.getStoredFile('name');
      assert.equal(isFile(filePath), false)
      done();
    })
  })
  it('gc', function(){
    var instance = FileCache();
    instance.gc(Date.now());
  })
})
describe('after', function(){
  it('after', function(done){
    var instance = FileCache();
    rmdir(APP_PATH, false).then(function(){
      done()
    })
  })
})