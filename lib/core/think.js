'use strict';

var fs = require('fs');
var path = require('path');
var baseClass = require('./base.js');
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
  bootstrap: 'bootstrap',
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
 * get common module path
 * @return {String} []
 */
think.getModulePath = function(module){
  if (think.mini) {
    return think.APP_PATH;
  }
  module = module || think.dirname.common;
  return think.APP_PATH + '/' + module;
}

/**
 * require module
 * @param  {String} name []
 * @return {mixed}      []
 */
think.require = function(name){
  if (!think.isString(name)) {
    return name;
  }
  if (think._aliasExport[name]) {
    return think._aliasExport[name];
  }
  // if (name[0] !== '/' && name.indexOf('/') > -1) {
  //   name = think.APP_PATH + '/' + name + '.js';
  // }
  var obj = require(name);
  if (think.isFunction(obj)) {
    obj.prototype.__filename = name;
  }
  //think._aliasExport[name] = obj;
  return obj;
}
/**
 * safe require
 * @param  {String} file []
 * @return {mixed}      []
 */
think.safeRequire = function(file){
  if (file[0] === '/' && !think.isFile(file)) {
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
var Class = think.Class;
think.Class = function(methods, clean){
  if (think.isObject(methods)) {
    return clean === true ? Class(methods) : Class(baseClass, methods);
  }else if (think.isFunction(methods)) {
    return Class(methods, clean);
  }
  return function(superClass, props){
    if (think.isObject(superClass)) {
      props = superClass;
      superClass = methods;
    }else if (think.isString(superClass)) {
      superClass = methods + '_' + superClass;
    }
    superClass = think.require(superClass);
    return Class(superClass, props);
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
think.getModuleConfig = function(module){
  if (!think.debug && module in think._moduleConfig) {
    return think._moduleConfig[module];
  }
  var rootPath;
  if (module === true) {
    rootPath = think.THINK_LIB_PATH + '/config';
  }else{
    rootPath = think.getModulePath(module) + '/' + think.dir.config;
  }
  //config.js
  var file = rootPath + '/config.js';
  var config = think.extend({}, think.safeRequire(file));
  //mode.js
  file = rootPath + '/mode.js';
  var modeConfig = think.safeRequire(file) || {};
  if (module in modeConfig) {
    config = think.extend(config, modeConfig[module]);
  }
  if (think.debug) {
    //debug.js
    file = rootPath + '/debug.js';
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
var middleware = null;
think.middleware = function(superClass, props, data){
  //exec middleware
  if (arguments.length >= 2 && props && props.req && props.res) {
    var name = superClass, http = props;
    if (think.isString(name)) {
      var cls = think.require('middleware_' + name);
      return think.co.wrap(cls(http).run)(data);
    }else{
      return think.co.wrap(name)(http, data);
    }
  }
  if (!middleware) {
    middleware = think.Class('middleware');
  }
  //create middleware
  return middleware(superClass, props);
}
/**
 * create, register, call adapter
 * @param  {String} name []
 * @return {void}      []
 */
think.adapter = function(type, name, fn){
  //load sys adapter
  think.loadAdapter();

  var length = arguments.length, key = 'adapter_' + type;
  //register adapter
  //think.adapter('session', 'redis', function(){})
  if (length === 3 && think.isFunction(fn)) {
    if (name !== 'base') {
      key += '_' + name;
    }
    think._aliasExport[key] = fn;
    return;
  }
  //invoke adapter
  //think.adapter('session', 'redis')
  if (length === 2 && think.isString(name)) {
    key += '_' + name;
    if (!(key in think._aliasExport)) {
      throw new Error('adapter ' + type + ' ' + name + ' not found');
    }
    return think._aliasExport[key];
  }
  //create adapter
  //module.exports = think.adapter({})
  //module.exports = think.adapter(superClass, {});
  var superClass, methods = type;
  if (think.isFunction(type)) {
    superClass = type;
    methods = name;
  }else if (think.isString(type)) {
    //get superClass from alias
    if (think._aliasExport[key]) {
      superClass = think._aliasExport[key];
    }else{
      //superClass is base class
      superClass = baseClass;
    }
    methods = name;
  }
  //create clean Class
  if (!superClass) {
    return think.Class(type, true);
  }
  return think.Class(superClass, methods);
}
/**
 * load system & comon module adapter
 * @return {} []
 */
var adapterLoaded = false;
think.loadAdapter = function(force){
  if (adapterLoaded && !force) {
    return;
  }
  adapterLoaded = true;
  var paths = [think.THINK_LIB_PATH + '/adapter'];
  //common module adapter
  var adapterPath = think.getModulePath() + '/' + think.dirname.adapter;
  if (think.isDir(adapterPath)) {
    paths.push(adapterPath);
  }
  paths.forEach(function(path){
    var dirs = fs.readdirSync(path);
    dirs.forEach(function(dir){
      think.alias('adapter_' + dir, path + '/' + dir);
    })
  })
}

/**
 * module alias
 * @type {Object}
 */
think._alias = {};
/**
 * module alias export
 * @type {Object}
 */
think._aliasExport = {};
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
      name = name === 'base' ? type : (type + '_' + name);
      think._alias[name] = path + '/' + file;
    })
  })
}
/**
 * route list
 * @type {Array}
 */
think.route = [];

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