//路径常量测试

var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');

describe('Const', function(){
  var consts = [
    'APP_PATH', 'RUNTIME_PATH', 'APP_DEBUG',
    'RESOURCE_PATH', 'THINK_PATH', 'APP_MODE',
    'THINK_VERSION', 'THINK_LIB_PATH', 'THINK_EXTEND_PATH',
    'COMMON_PATH', 'LIB_PATH', 'CONF_PATH', 'LANG_PATH',
    'VIEW_PATH', 'LOG_PATH', 'TEMP_PATH', 'DATA_PATH',
    'CACHE_PATH'
  ];
  consts.forEach(function(item){
    it('global.' + item + ' is defined. ' + global[item], function(){
      assert.equal(global[item] !== undefined, true);
    })
  })
})