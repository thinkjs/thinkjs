var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var Socket = require('net').Socket;
var IncomingMessage = require('http').IncomingMessage;


global.APP_PATH = path.normalize(__dirname + '/../../App');
global.RESOURCE_PATH = path.normalize(__dirname + '/../../www')
process.execArgv.push('--no-init');
require(path.normalize(__dirname + '/../../../index.js'));

var Think = require(THINK_PATH + '/Lib/Core/Think.js');

var clearRequireCache = function(){
  for(var name in require.cache){
    if(name.indexOf('/Conf/') > -1 || name.indexOf('/Common/') > -1){
      delete require.cache[name];
    }
  }
}


describe('Think', function(){
  it('init', function(){
    Think.init();
    var path = [
      'COMMON_PATH', 'THINK_LIB_PATH', 'THINK_EXTEND_PATH', 'LIB_PATH', 'CONF_PATH', 'LANG_PATH', 'VIEW_PATH', 'LOG_PATH',
      'TEMP_PATH', 'DATA_PATH', 'CACHE_PATH'
    ];
    path.forEach(function(item){
      assert.equal(typeof global[item] !== undefined, true);
    })
  })
  it('init 2', function(){
    Think.init();
    var path = [
      'COMMON_PATH', 'THINK_LIB_PATH', 'THINK_EXTEND_PATH', 'LIB_PATH', 'CONF_PATH', 'LANG_PATH', 'VIEW_PATH', 'LOG_PATH',
      'TEMP_PATH', 'DATA_PATH', 'CACHE_PATH'
    ];
    path.forEach(function(item){
      assert.equal(typeof global[item] !== undefined, true);
    })
  })
  it('log', function(){
    var data = Think.log();
    assert.equal(data, undefined);
  })
  it('safeRequire', function(){
    var data = Think.safeRequire('wwww');
    assert.deepEqual(data, {})
  })
  it('safeRequire', function(){
    var data = Think.safeRequire(THINK_PATH + '/Conf/alias.js');
    assert.deepEqual(data.Controller !== undefined, true)
  })
  it('processEvent', function(){
    assert.equal(typeof Think.processEvent, 'function');
    Think.processEvent();
    //process.emit('uncaughtException', []);
  })
  it('loadFiles', function(){
    Think.loadFiles();
    assert.equal(C('not_config'), undefined);
  })
  it('loadFiles app config', function(done){
    var file = CONF_PATH + '/config.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={danymic_config_name: 'welefen'}");
    Think.loadFiles();
    assert.equal(C('danymic_config_name'), 'welefen');
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadFiles cli config', function(done){
    var file = CONF_PATH + '/mode.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={cli: {cli_config_name: 'welefen'}}");
    Think.loadFiles();
    assert.equal(C('cli_config_name'), 'welefen');
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadFiles cli config1', function(done){
    var file = CONF_PATH + '/mode.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={xxxx: {cli_config_name111: 'welefen'}}");
    Think.loadFiles();
    assert.equal(C('cli_config_name111'), undefined);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadFiles other mode', function(done){
    var file = CONF_PATH + '/mode.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={xxxx: {cli_config_name111: 'welefen'}}");
    APP_MODE = 'otherMode';
    Think.loadFiles();
    assert.equal(C('cli_config_name111'), undefined);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
    APP_MODE = 'cli';
  })
  it('loadFiles empty mode', function(done){
    var file = CONF_PATH + '/mode.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={xxxx: {cli_config_name111: 'welefen'}}");
    APP_MODE = '';
    Think.loadFiles();
    assert.equal(C('cli_config_name111'), undefined);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
    APP_MODE = 'cli';
  })
  it('loadFiles route', function(done){
    var file = CONF_PATH + '/route.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports=[]");
    Think.loadFiles();
    assert.deepEqual(C('url_route_rules'), []);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadFiles alias', function(done){
    var file = CONF_PATH + '/alias.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={}");
    Think.loadFiles();
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadFiles common', function(done){
    var file = COMMON_PATH + '/common.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "global.xxxx_fn = function(){}");
    Think.loadFiles();
    assert.equal(typeof xxxx_fn, 'function')
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })

  it('parseGroupList', function(){
    Think.parseGroupList();
    assert.deepEqual(C('app_group_list'), ['home', 'admin', 'restful'])
  })
  it('parseGroupList, has Controller path', function(done){
    mkdir(LIB_PATH + '/Controller/Home')
    mkdir(LIB_PATH + '/Controller/Admin');
    Think.parseGroupList();
    assert.deepEqual(C('app_group_list'), ['admin', 'home'])
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('parseGroupList, has Controller path, with deny_group_list', function(done){
    mkdir(LIB_PATH + '/Controller/Home')
    mkdir(LIB_PATH + '/Controller/Admin');
    C('deny_group_list', ['admin'])
    Think.parseGroupList();
    assert.deepEqual(C('app_group_list'), ['home'])
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadTag', function(){
    Think.loadTag();
    var tag = C('tag');
    assert.equal('app_init' in tag, true);
  })
  it('loadTag app empty tag', function(done){
    var file = CONF_PATH + '/tag.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports = {}");
    Think.loadFiles();
    var tag = C('tag');
    assert.equal('app_init' in tag, true);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadTag app tag', function(done){
    clearRequireCache();
    var file = CONF_PATH + '/tag.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports = {user_tag_name: []}");
    Think.loadFiles();
    var tag = C('tag');
    assert.equal('user_tag_name' in tag, false);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadTag app tag', function(done){
    clearRequireCache();
    var file = CONF_PATH + '/tag.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports = {user_tag_name: ['user']}");
    Think.loadFiles();
    var tag = C('tag');
    assert.equal('user_tag_name' in tag, true);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadTag tag replace', function(done){
    clearRequireCache();
    var file = CONF_PATH + '/tag.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports = {resource_check: [true, 'user']}");
    Think.loadFiles();
    var tag = C('tag');
    assert.deepEqual(tag.resource_check, ['user']);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadTag tag prepend', function(done){
    clearRequireCache();
    var file = CONF_PATH + '/tag.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports = {resource_check: [false, 'user']}");
    Think.loadFiles();
    var tag = C('tag');
    assert.deepEqual(tag.resource_check, ['user', 'CheckResource']);
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
  it('loadExtFiles', function(done){
    clearRequireCache();
    Think.loadExtFiles();
    assert.equal(typeof global.appDefinedFn, 'undefined');
    done();
  })
  it('loadExtFiles', function(done){
    clearRequireCache();
    C('load_ext_file', 'common1,cache')
    Think.loadExtFiles();
    assert.equal(typeof global.appDefinedFn, 'undefined');
    done();
  })
  it('loadExtFiles', function(done){
    clearRequireCache();
    C('load_ext_file', ['common1','cache'])
    Think.loadExtFiles();
    assert.equal(typeof global.appDefinedFn, 'undefined');
    done();
  })
  it('loadExtFiles common1 file', function(done){
    clearRequireCache();
    C('load_ext_file', ['common1','cache'])
    var file = COMMON_PATH + '/common1.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "global.appDefinedFn = function(){}");
    Think.loadExtFiles();
    assert.equal(typeof global.appDefinedFn, 'function');
    done();
  })
  it('loadExtConfig', function(done){
    clearRequireCache();
    Think.loadExtConfig();
    assert.equal(typeof C('app_defined_config'), 'undefined');
    done();
  })
  it('loadExtConfig', function(done){
    clearRequireCache();
    C('load_ext_config', ['db'])
    Think.loadExtConfig();
    assert.equal(typeof C('app_defined_config'), 'undefined');
    done();
  })
  it('loadExtConfig', function(done){
    clearRequireCache();
    C('load_ext_config', 'db')
    Think.loadExtConfig();
    assert.equal(typeof C('app_defined_config'), 'undefined');
    done();
  })
  it('loadExtConfig config exist', function(done){
    clearRequireCache();
    var file = CONF_PATH + '/db.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={app_defined_config: true}");
    C('load_ext_config', 'db')
    Think.loadExtConfig();
    assert.equal(C('app_defined_config'), true);
    done();
  })
  it('loadDebugFiles', function(done){
    clearRequireCache();
    Think.loadDebugFiles();
    assert.equal(C('db_cache_on'), false);
    done();
  })
  it('loadDebugFiles config', function(done){
    clearRequireCache();
    var file = CONF_PATH + '/debug.js';
    mkdir(path.dirname(file))
    fs.writeFileSync(file, "module.exports={db_cache_on: 1111}");
    Think.loadDebugFiles();
    assert.equal(C('db_cache_on'), 1111);
    done();
  })
  it('loadDebugFiles config', function(done){
    clearRequireCache();
    var file = CONF_PATH + '/debug.js';
    mkdir(path.dirname(file))
    APP_MODE = '';
    fs.writeFileSync(file, "module.exports={db_cache_on: 1111}");
    Think.loadDebugFiles();
    assert.equal(C('db_cache_on'), 1111);
    done();
  })


  it('debug', function(done){
    clearRequireCache();
    var fn = global.setInterval;
    global.setInterval = function(callback){
      C('debug_retain_files', ['/node_modules/', '/Lib/'])
      callback();
    }
    Think.debug();
    done();
  })
  it('debug clear_require_cache off', function(done){
    clearRequireCache();
    C('clear_require_cache', false);
    Think.debug();
    done();
  })
  it('debug, platform', function(done){
    //clearRequireCache();
    var platform = process.platform;
    process.platform = 'win32'
    var fn = global.setInterval;
    global.setInterval = function(callback){
      callback();
      process.platform = platform;
    }
    Think.debug();
    done();
  })
  it('debug, clear', function(done){
    //clearRequireCache();
    var fn = global.setInterval;
    global.setInterval = function(callback){
      C('debug_retain_files', ['debug'])
      callback();
      global.setInterval = fn;
    }
    Think.debug();
    done();
  })
  it('logPid', function(done){
    Think.logPid();
    assert.equal(isFile(DATA_PATH + '/app.pid'), true)
    done();
  })
  it('mergeAutoloadPath', function(){
    Think.mergeAutoloadPath();
  })
  it('mergeAutoloadPath', function(){
    C('autoload_path', {
      Test: 'fsadf'
    })
    Think.mergeAutoloadPath();
  })
  it('mergeAutoloadPath', function(){
    C('autoload_path', {
      Test: [true, 'ddd']
    })
    Think.mergeAutoloadPath();
  })
  it('mergeAutoloadPath', function(){
    C('autoload_path', {
      Test: ['ddd']
    })
    Think.mergeAutoloadPath();
  })
  it('autoload', function(){
    var file = Think.autoload('AdvModel');
    assert.equal(file.indexOf('AdvModel.js') > -1, true);
  })
  it('run', function(){
    Think.run();
  })
  it('run, APP_DEBUG', function(){
    var fn = global.setInterval;
    global.setInterval = function(callback){
      callback();
    }
    APP_DEBUG = true;
    Think.run();
    APP_DEBUG = false;
    global.setInterval = fn;
  })
  

})

describe('after', function(){
  it('after', function(done){
    muk.restore();
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
})