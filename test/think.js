var fs = require('fs');
var should = require('should');
var assert = require('assert');
var path = require('path');

var clearCache = function(){
  for(var name in require.cache){
    delete require.cache[name];
  }
}

describe('before', function(){
  it('before', function(){
    process.execArgv.push('--no-init');
  })
})
describe('think', function(){
  it('APP_PATH it not defined', function(){
    try{
      require(path.normalize(__dirname + '/../lib/think.js'));
    }catch(e){
      assert.equal(e.message, 'APP_PATH must be defined');
    }
  })
  it('RUNTIME_PATH', function(done){
    global.APP_PATH = __dirname;
    global.RUNTIME_PATH = undefined;
    clearCache()
    require(path.normalize(__dirname + '/../lib/think.js'));
    assert.equal(global.RUNTIME_PATH, __dirname + '/Runtime')
    done();
  })
  it('APP_DEBUG', function(done){
    clearCache();
    global.APP_DEBUG = false;
    require(path.normalize(__dirname + '/../lib/think.js'));
    assert.equal(APP_DEBUG, false);
    done();
  })
  it('APP_DEBUG true', function(done){
    global.APP_DEBUG = true;
    clearCache();
    require(path.normalize(__dirname + '/../lib/think.js'));
    assert.equal(global.APP_DEBUG, true)
    done();
  })
  it('process.argv[2] = online', function(){
    process.argv[2] = 'online';
    global.APP_DEBUG = true;
    clearCache();
    require(path.normalize(__dirname + '/../lib/think.js'));
    assert.equal(global.APP_DEBUG, false)
  })
  it('APP_DEBUG with execArgv', function(done){
    process.execArgv.push('--debug');
    clearCache();
    global.APP_DEBUG = false;
    require(path.normalize(__dirname + '/../lib/think.js'));
    assert.equal(global.APP_DEBUG, true);
    done();
  })
})

describe('after', function(){
  it('after', function(){
    process.execArgv = [];
  })
})
