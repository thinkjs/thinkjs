'use strict';

var fs = require('fs');
var path = require('path');
var base = require('./base.js');
var thinkit = require('thinkit');
var co = require('co');

/**
 * global cache
 * @type {Object}
 */
global.thinkCache = {};

/**
 * global think variable
 * @type {Object}
 */
global.think = {};
/**
 * apply thinkit methods to think
 */
for(var name in thinkit){
  think[name] = thinkit[name];
}
/**
 * app dir name, can be set in init
 * @type {Object}
 */
think.dirname = {
  config: 'config',
  controller: 'controller',
  model: 'model',
  adapter: 'adapter',
  logic: 'logic',
  service: 'service',
  view: 'view',
  middleware: 'middleware',
  runtime: 'runtime',
  common: 'common',
  bootstrap: 'bootstrap'
}
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
 * mini app mode
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
 * module list
 * @type {Array}
 */
think.module = [];

/**
 * alias co module to think.co
 * @type {Object}
 */
think.co = co;

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
    if (name in think._alias) {
      name = think._alias[name];
    }else if (name.indexOf('/') > -1) {
      name = think.APP_PATH + '/' + name + '.js';
    }
  }
  var obj = think.safeRequire(name);
  if (think.isFunction(obj)) {
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
  if (!think.isFile(file)) {
    return null;
  }
  try{
    return require(file);
  }catch(e){
    if (think.debug) {
      console.error(e.stack);
    }
  }
  return null;
}
/**
 * log
 * @return {} []
 */
think.log = function(){

}
/**
 * create class
 * @param {Object} props [methods and props]
 */
think.Class = function(methods){
  if (!think.isString(methods)) {
    return think.Class(base, methods);
  }
  return function(superClass, props){
    if (think.isObject(superClass)) {
      props = superClass;
      superClass = methods;
    }else if (think.isString(superClass)) {
      superClass += '_' + methods;
    }
    superClass = think.require(superClass);
    return think.Class(superClass, props);
  }
}
/**
 * think sys & common config
 * @type {Object}
 */
think._config = {};
/**
 * get or set config
 * @return {mixed} []
 */
think.config = function(name, value, data){
  data = data || this._config;
  if (think.isObject(name)) {
    think.extend(data, name);
  }else if(think.isString(name)){
    name = name.toLowerCase();
    //one grade config
    if (name.indexOf('.') === -1) {
      if (value === undefined) {
        return data[name];
      }
      data[name] = value;
      return;
    }
    name = name.split('.');
    if (value === undefined) {
      value = data[name[0]] || {};
      return value[name[1]];
    }
    if (!(name[0] in data)) {
      data[name[0]] = {};
    }
    data[name[0]][name[1]] = value;
  }
}
/**
 * module config
 * @type {Object}
 */
think._moduleConfig = {};
/**
 * get module config
 * @param  {String} module []
 * @return {Object}        []
 */
think.getModuleConfig = function(module, rootPath){
  if (!think.debug && module in think._moduleConfig) {
    return think._moduleConfig[module];
  }
  if (!rootPath) {
    rootPath = think.APP_PATH + (think.mini ? '' : '/' + module);
  }
  var configName = rootPath.indexOf(think.APP_PATH) > -1 ? think.dir.config : 'config';
  //config.js
  var file = rootPath + '/' + configName + '/config.js';
  var config = think.extend({}, think.safeRequire(file));
  //mode.js
  file = rootPath + '/' + configName + '/mode.js';
  var modeConfig = think.safeRequire(file) || {};
  if (module in modeConfig) {
    config = think.extend(config, modeConfig[module]);
  }
  if (think.debug) {
    //debug.js
    file = rootPath + '/' + configName + '/debug.js';
    config = think.extend(config, think.safeRequire(file));
    var _module = module + '_debug';
    if (_module in modeConfig) {
      config = think.extend(config, modeConfig[_module]);
    }
  }
  think._moduleConfig[module] = config;
  return config;
}
/**
 * hook list
 * @type {Object}
 */
think._hook = {};
/**
 * exec hook
 * @param  {String} name []
 * @return {}      []
 */
think.hook = function(name, http, data){
  if (!(name in think._hook)) {
    return Promise.resolve();
  }
  var list = think._hook[name];
  var index = 0, length = list.length;
  function execMiddleware(){
    if (index >= length) {
      return Promise.resolve();
    }
    var item = list[index++];
    return think.middleware(item, http, data).then(function(){
      return execMiddleware();
    });
  }
  return execMiddleware();
}
/**
 * create or exec middleware
 * @param  {Function} superClass []
 * @param  {Object} props      []
 * @return {mixed}            []
 */
var middleware = think.Class('middleware');
think.middleware = function(superClass, props, data){
  //exec middleware
  if (arguments.length >= 2 && props && props.req && props.res) {
    var name = superClass, http = props;
    if (think.isString(name)) {
      var cls = think.require(name + '_middleware');
      return think.co.wrap(cls(http).run)(data);
    }else{
      return think.co.wrap(name)(http, data);
    }
  }
  return middleware(superClass, props);
}
/**
 * support adapter
 * @return {Array}         []
 */
think._adapter = [];
/**
 * register adapter
 * @param  {String} name []
 * @return {void}      []
 */
think.adapter = function(name, sys){
  //adapter exist
  if (think._adapter.indexOf(name) > -1) {
    return;
  }
  //name exist in think
  if (name in think) {
    throw new Error('think[adapter] is defined, please change adapter name');
  }
  var dir = think.APP_PATH + '/' + think.dir.adapter + '/' + name;
  if (sys) {
    dir = think.THINK_LIB_PATH + '/adapter/' + name;
  }
  think._adapter.push(name);
  think.alias(name, dir);
  think[name] = think.Class(name);
}

/**
 * thinkjs module alias
 * @type {Object}
 */
think._alias = {};
/**
 * load alias
 * @param  {String} type  []
 * @param  {Array} paths []
 * @return {Object}       []
 */
think.alias = function(type, paths){
  if (!isArray(paths)) {
    paths = [paths];
  }
  paths.forEach(function(path){
    var files = think.getFiles(path);
    files.forEach(function(file){
      var name = file.slice(0, -3);
      name = name === 'base' ? type : name + '_' + type;
      think._alias[name] = path + '/' + file;
    })
  })
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
 * create middleware sub class
 * @type {Function}
 */
think.middleware = think.Class('middleware');