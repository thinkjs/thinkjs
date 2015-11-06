var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var thinkjs = require('../lib/index.js');

describe('index.js', function(){
  it('init', function(){
    var instance = new thinkjs();
    assert.equal(think.env, 'development')
  })
  it('think env, development', function(){
    process.argv[2] = 'development'
    var instance = new thinkjs();
    assert.equal(think.env, 'development')
  })
  it('think env, production', function(){
    process.argv[2] = 'production'
    var instance = new thinkjs();
    assert.equal(think.env, 'production')
  })
  it('think env, testing', function(){
    process.argv[2] = 'testing';
    var instance = new thinkjs();
    assert.equal(think.env, 'testing')
  })
  it('think port', function(){
    process.argv[2] = 1234;
    var instance = new thinkjs();
    assert.equal(think.port, 1234)
  })
  it('think cli', function(){
    process.argv[2] = 'home/index/index';
    var instance = new thinkjs();
    assert.equal(think.cli, 'home/index/index')
  })
  it('think, restore', function(){
    delete process.argv[2];
    think.env = 'development';
    think.port = '';
    think.cli = '';
    var instance = new thinkjs();
    assert.equal(think.cli, '')
  })
  it('getMode, module', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    var mode = instance.getMode();
    assert.equal(mode, think.mode_module);
  })
  it('getMode, mini', function(done){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mkdir(think.APP_PATH + '/controller');
    fs.writeFileSync(think.APP_PATH + '/controller/index.js', 'file content');
    var mode = instance.getMode();
    assert.equal(mode, think.mode_mini);
    think.rmdir(think.APP_PATH).then(done)
  })
  it('getMode, normal', function(done){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mkdir(think.APP_PATH + '/controller/home');
    fs.writeFileSync(think.APP_PATH + '/controller/home/index.js', 'file content');
    var mode = instance.getMode();
    assert.equal(mode, think.mode_normal);
    think.rmdir(think.APP_PATH).then(done)
  })
  it('checkNodeVersion, need update', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    muk(process, 'version', '#0.10.0');
    muk(process, 'exit', function(){
      muk.restore();
    })
    muk(think, 'log', function(){})
    instance.checkNodeVersion();
  })
  it('loadAlias', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    instance.loadAlias();
    var alias = thinkCache(thinkCache.ALIAS);
    assert.equal(think.isObject(alias), true)
  })
  it('loadAlias', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    instance.loadAliasExport();
    var alias = thinkCache(thinkCache.ALIAS_EXPORT);
    assert.equal(think.isObject(alias), true)
  })
  it('load', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    instance.load();
  })
  it('captureError', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    muk(think, 'log', function(err){
      assert.equal(err.message, 'captureError');
    })
    muk(process, 'on', function(type, callback){
      assert.equal(type, 'uncaughtException');
      callback && callback(new Error('captureError'))
      muk.restore();
    })
    instance.captureError();
  })
  it('start, autoReload off', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.config('auto_reload', false);
    instance.start();
  })
  it('start, autoReload on', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    var flag = false;
    instance.autoReload = function(){
      flag = true;
    }
    think.config('auto_reload', true);
    instance.start();
    assert.equal(flag, true);
  })
  it('run', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    instance.autoReload = function(){
    }
    var app = think.require('app');
    var flag = false;
    muk(app, 'run', function(){
      flag = true;
    })
    instance.run();
    muk.restore();
    assert.equal(flag, true);
  })
  // it('autoReload', function(){
  //   var instance = new thinkjs({
  //     APP_PATH: __dirname + '/testApp',
  //     ROOT_PATH: __dirname
  //   });
  //   muk(global, 'setInterval', function(fn, time){
  //     fn();
  //   })
  //   instance.autoReload();
  // })
  // it('checkAppPath, empty', function(){
  //   var instance = new thinkjs({
  //     ROOT_PATH: __dirname,
  //     APP_PATH: __dirname + '/testApp',
  //   });
  //   instance.checkAppPath();
  // })
  // it('checkAppPath, empty', function(done){
  //   var instance = new thinkjs({
  //     ROOT_PATH: __dirname,
  //     APP_PATH: __dirname + '/testApp',
  //   });
  //   think.mkdir(think.APP_PATH)
  //   instance.checkAppPath();
  //   think.rmdir(think.APP_PATH).then(done)
  // })
  // it('checkAppPath, has src', function(done){
  //   var instance = new thinkjs({
  //     APP_PATH: __dirname + '/testApp',
  //     ROOT_PATH: __dirname
  //   });
  //   think.mkdir(think.ROOT_PATH + '/src');
  //   var flag = 0;
  //   muk(think, 'log', function(fn){
  //     fn({red: function(){}, cyan: function(){}});
  //     flag++;
  //   })
  //   muk(process, 'exit', function(){
  //     flag++;
  //   })
  //   instance.checkAppPath();
  //   assert.equal(flag, 2);
  //   muk.restore();
  //   think.rmdir(think.ROOT_PATH + '/src').then(done);
  // })
  it('checkFileName, path not exist', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    instance.checkFileName();
  })
  it('checkFileName, path not exist', function(done){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mkdir(think.APP_PATH + '/controller/');
    fs.writeFileSync(think.APP_PATH + '/controller/a.js', 'www')
    instance.checkFileName();
    think.rmdir(think.APP_PATH).then(done)
  })
  it('checkFileName, special file', function(done){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mkdir(think.APP_PATH + '/controller/');
    fs.writeFileSync(think.APP_PATH + '/controller/a.test', 'www')
    instance.checkFileName();
    think.rmdir(think.APP_PATH).then(done)
  })
  it('checkFileName, locale file', function(done){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mkdir(think.APP_PATH + '/common/config/locale');
    fs.writeFileSync(think.APP_PATH + '/common/config/locale/zh-CN.js', 'www')
    instance.checkFileName();
    think.rmdir(think.APP_PATH).then(done)
  })
  it('getModule, mini', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mode = think.mode_mini;
    var modules = instance.getModule();
    assert.deepEqual(modules, ['home'])
  })
  it('getModule, normal, empty', function(){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mode = think.mode_normal;
    var modules = instance.getModule();
    assert.deepEqual(modules, [])
  })
  it('getModule, normal', function(done){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mode = think.mode_normal;
    think.mkdir(think.APP_PATH + '/controller/home');
    think.mkdir(think.APP_PATH + '/controller/admin');
    var modules = instance.getModule();
    assert.deepEqual(modules, ['admin', 'home']);
    think.rmdir(think.APP_PATH).then(done);
  })
  it('getModule, normal', function(done){
    var instance = new thinkjs({
      APP_PATH: __dirname + '/testApp',
      ROOT_PATH: __dirname
    });
    think.mode = think.mode_normal;
    think.mkdir(think.APP_PATH + '/controller/home');
    think.mkdir(think.APP_PATH + '/controller/admin');
    think.config('deny_module_list', ['home'])
    var modules = instance.getModule();
    assert.deepEqual(modules, ['admin']);
    think.rmdir(think.APP_PATH).then(function(){
      done();
      think.config('deny_module_list', [])
    });
  })
})