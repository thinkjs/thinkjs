'use strict';

var fs = require('fs');
var path = require('path');
var common = require('../common/common.js');
var base = require('./base.js');

/**
 * cache
 * @type {Object}
 */
global.thinkCache = {
  /**
   * base cache
   * @type {Object}
   */
  base: {},
  /**
   * session cache
   * @type {Object}
   */
  session: {},
  /**
   * db cache
   * @type {Object}
   */
  db: {}
};
/**
 * global think variable
 * @type {Object}
 */
global.think = {};
/**
 * debug
 * @type {Boolean}
 */
think.debug = false;
/**
 * server port
 * @type {Number}
 */
think.port = 0;
/**
 * app mode
 * @type {String}
 */
think.mode = 'http';
/**
 * app is mini mode
 * @type {Boolean}
 */
think.mini = false;
/**
 * thinkjs module root path
 * @type {String}
 */
think.THINK_PATH = path.normalize(__dirname + '/../../');
/**
 * thinkjs module lib path
 * @type {String}
 */
think.THINK_LIB_PATH = path.normalize(__dirname + '/../');
/**
 * thinkjs version
 * @param  {) []
 * @return {}         []
 */
think.version = (function(){
  var packageFile = think.THINK_PATH + '/package.json';
  var json = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
  return json.version;
})();
/**
 * thinkjs config
 * @type {Object}
 */
think.config = {};
/**
 * module config
 * @type {Object}
 */
think.moduleConfig = {};
/**
 * thinkjs module alias
 * @type {Object}
 */
think.alias = {};
/**
 * hook list
 * @type {Object}
 */
think.hook = {};
/**
 * module list, not contain common module
 * @type {Array}
 */
think.moduleList = [];
/**
 * load alias
 * @return {[type]} [description]
 */
think.loadAlias = function(){
  var data = extend({}, require(think.THINK_LIB_PATH + '/config/alias.js'));
  var common = think.mini ? '' : 'common/';
  //sys controller & model
  ['controller', 'model'].forEach(function(item){
    var dir = think.THINK_LIB_PATH + '/' + item;
    var files = getFiles(dir);
    files.forEach(function(file){
      var name = file.slice(0, -3);
      name = name === 'base' ? item : name + '_' + item;
      data[name] = dir + '/' + file;
    })
  });
  //behavior
  var behaviorPaths = [
    think.THINK_LIB_PATH + '/behavior',
    think.APP_PATH + '/' + common + 'behavior'
  ];
  behaviorPaths.forEach(function(dir){
    var files = getFiles(dir);
    files.forEach(function(file){
      var name = file.slice(0, -3);
      name = name === 'base' ? 'behavior' : name + '_behavior';
      data[name] = dir + '/' + file;
    })
  });
  //driver
  var driverPaths = [
    think.THINK_LIB_PATH + '/driver',
    think.APP_PATH + '/' + common +'driver'
  ];
  driverPaths.forEach(function(driver){
    ['cache', 'db', 'session', 'template'].forEach(function(type){
      var dir = driver + '/' + type;
      var files = getFiles(dir);
      files.forEach(function(file){
        var name = file.slice(0, -3);
        name = name === 'base' ? type : name + '_' + type;
        data[name] = dir + '/' + file;
      })
    })
  });
  //reset think alias
  think.alias = data;
}
/**
 * load hook
 * @return {Object} []
 */
think.loadHook = function(){
  var hook = extend({}, require(think.THINK_LIB_PATH + '/config/hook.js'));
  var common = think.mini ? '' : 'common/';
  var file = think.APP_PATH + '/' + common + 'config/hook.js';
  if (isFile(file)) {
    var data = think.safeRequire(file);
    var key, value;
    for(key in data){
      value = data[key];
      if (!(key in hook)) {
        hook[key] = data[key];
      }else if (isBoolean(data[0])) {
        var flag = value.shift();
        if (flag) {
          hook[key] = value;
        }else{
          hook[key] = value.concat(hook[key]);
        }
      }else{
        hook[key] = hook[key].concat(value);
      }
    }
  }
  think.hook = hook;
}
/**
 * load config
 * @return {} []
 */
think.loadConfig = function(){
  var config = extend({}, require('../config/config.js'));

}
/**
 * get module config
 * @param  {String} module []
 * @return {Object}        []
 */
think.getModuleConfig = function(module){
  if (!think.debug && module in think.moduleConfig) {
    return think.moduleConfig;
  }
  var modulePath = think.mini ? '' : module + '/';
  //config.js
  var file = think.APP_PATH + '/' + modulePath + 'config/config.js';
  var config = extend({}, think.safeRequire(file));
  //mode.js
  file = think.APP_PATH + '/' + modulePath + 'config/mode.js';
  var modeConfig = think.safeRequire(file);
  if (module in modeConfig) {
    config = extend(config, modeConfig[module]);
  }
  if (think.debug) {
    //debug.js
    file = think.APP_PATH + '/' + modulePath + 'config/debug.js';
    config = extend(config, think.safeRequire(file));
    var _module = module + '_debug';
    if (_module in modeConfig) {
      config = extend(config, modeConfig[_module]);
    }
  }
  think.moduleConfig[module] = config;
  return config;
}
/**
 * load extension config
 * @param  {Array} files []
 * @return {}       []
 */
think.loadExtConfig = function(files){
  files = files || think.config.load_ext_config;
  if (!isArray(files)) {
    throw new Error('files must be array');
  }
  files.forEach(function(file){
    var common = think.mini ? '' : 'common/';
    var filepath = think.APP_PATH + '/' + common + 'config/' + file + '.js';
    var config = think.safeRequire(filepath);
    exntend(think.config, config);
  })
}
/**
 * require module
 * @param  {String} name []
 * @return {mixed}      []
 */
think.require = function(name){
  if (!isString(name)) {
    return name;
  }
  if (name[0] !== '/') {
    if (name in think.alias) {
      name = think.alias[name];
    }else if (name.indexOf('/') > -1) {
      name = think.APP_PATH + '/' + name + '.js';
    }
  }
  var obj = require(name);
  if (isFunction(obj)) {
    obj.prototype.__filename = name;
  }
  return obj;
}
/**
 * safe require
 * @param  {String} file []
 * @return {mixed}      []
 */
think.safeRequire = function(file){
  try{
    return require(file);
  }catch(e){
    if (think.debug) {
      console.error(e.stack);
    }
  }
  return {};
}
/**
 * create class
 * @param {Object} props [methods and props]
 */
think.Class = function(methods){
  if (isString(methods)) {
    return function(superClass, props){
      if (isObject(superClass)) {
        props = superClass;
        superClass = methods;
      }else if (isString(superClass)) {
        superClass += '_' + methods;
      }
      superClass = think.require(superClass);
      return Class(superClass, props);
    }
  }
  return Class(base, methods);
}
/**
 * create controller sub class
 * @type {Function}
 */
think.controller = think.Class('controller');
/**
 * create logic class
 * @type {Function}
 */
think.logic = think.controller;
/**
 * create model sub class
 * @type {Function}
 */
think.model = think.Class('model');
/**
 * create behavior sub class
 * @type {Function}
 */
think.behavior = think.Class('behavior');
/**
 * create cache sub class
 * @type {Function}
 */
think.cache = think.Class('cache');
/**
 * create db sub class
 * @type {Function}
 */
think.db = think.Class('db');
/**
 * create session sub class
 * @type {Function}
 */
think.session = think.Class('session');
/**
 * create template sub class
 * @type {Function}
 */
think.template = think.Class('template');
/**
 * get cache value
 * @param  {String} type [cache type]
 * @param  {[type]} key  [description]
 * @return {[type]}      [description]
 */
think.getCache = function(type, key){
  if (type in thinkCache) {
    return thinkCache[type][key];
  }
  throw new Error('cache type ' + type + ' is not valid');
}