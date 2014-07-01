var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');

describe('thinkRequire', function(){
  it('thinkRequire is function', function(){
    assert.equal(isFunction(thinkRequire), true)
  })
  it('thinkRequire(function(){})', function(){
    var fn = thinkRequire(function(){});
    assert.equal(isFunction(fn), true);
  })
  it('thinkRequire("modulenotexist")', function(){
    var module = '';
    try{
      module = thinkRequire('modulenotexist');
    }catch(e){}
    assert.equal(module, '')
  })
  var list = [
    'Controller', 'App', 'Behavior', 'Cache', 'Db', 
    'Dispatcher', 'Filter', 'Http', 'Model', 
    'Session', 'Think', 'Valid', 'View', 'Cookie', 'WebSocket',
    'AdvModel', 'CheckResourceBehavior', 'CheckRouteBehavior',
    'DenyIpBehavior', 'LocationTemplateBehavior', 'ParseTemplateBehavior',
    'ReadHtmlCacheBehavior', 'WriteHtmlCacheBehavior', 'FileCache',
    'MemcacheCache', 'MysqlDb', 'DbSession', 'FileSession', 'MemcacheSocket',
    'MysqlSocket', 'EjsTemplate', 'RestController'
  ];
  list.forEach(function(item){
    it(item + ' is module', function(){
      var module = thinkRequire(item);
      assert.equal(isFunction(module) || isObject(module), true)
    })
  })
})

describe('inherits from base Class', function(){
  it('inherits from FileCache', function(){
    var fileCache = thinkRequire('FileCache');
    var cls = Cache('FileCache', function(){})
    assert.equal(cls.super_ === fileCache, true)
  })
  it('inherits from Cache', function(){
    var cache = thinkRequire('Cache');
    var cls = Cache(function(){})
    assert.equal(cls.super_ === cache, true)
  })
})


describe('B', function(){
  it('B(function(){})', function(){
    var fn = function(){
      return 'welefen';
    }
    assert.equal(B(fn), 'welefen')
  })
  it('B("DenyIpBehavior") = true', function(){
    assert.equal(B('DenyIp'), true)
  })
  it('B("DenyIpBehavior"), promise', function(){
    C('deny_ip', ['127.0.0.1']);
    var result = B('DenyIp', {
      ip: function(){
        return '127.0.0.1';
      },
      res: {
        end: function(){}
      }
    });
    assert.equal(isFunction(result.then), true)
  })
})

describe('tag', function(){
  
})



