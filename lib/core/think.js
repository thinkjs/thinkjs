'use strict';

var fs = require('fs');
var path = require('path');
var thinkit = require('thinkit');
var co = require('co');
var util = require('util');
var crypto = require('crypto');
var querystring = require('querystring');

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
 * server start time
 * @type {Number}
 */
think.startTime = Date.now();
/**
 * create class
 * @param {Object} props [methods and props]
 */
var Class = think.Class;
think.Class = function(methods, clean){
  // think.Class({})
  // think.Class({}, true)
  if (think.isObject(methods)) {
    return clean === true ? Class(methods) : Class(think.Base, methods);
  }
  // think.Class(function(){}, {})
  else if (think.isFunction(methods)) {
    return Class(methods, clean);
  }
  //create class
  return function(superClass, props){
    // think.controller();
    // think.controller({})
    if (think.isObject(superClass) || !superClass) {
      props = superClass;
      superClass = methods + '_base';
    }
    // think.controller('superclass', {})
    else if (think.isString(superClass)) {
      superClass = superClass.split('/');
      var len = superClass.length;
      // think.controller('base', {})
      if (len === 1) {
        var cls = think.dirname.common + '/' + methods + '/' + superClass[0];
        if (think._aliasExport[cls]) {
          superClass = cls;
        }else{
          superClass = methods + '_' + superClass[0];
        }
      }else if (len === 2) {
        // think.controller('controller/base', {})
        if (think.mini) {
          superClass = think.dirname.common + '/' + superClass[0] + '/' + superClass[1];
        }
        // think.controller('common/base', {})
        else{
          superClass = superClass[0] + '/' + methods + '/' + superClass[1];
        }
      }
    }
    if (think.isString(superClass)) {
      superClass = think.require(superClass);
      // get class
      // think.controller('rest')
      if (!props) {
        return superClass;
      }
    }
    return Class(superClass, props);
  }
}
/**
 * base class
 * @type {}
 */
think.Base = require('./base.js');

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
  local: 'local'
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
think.require = function(name, flag){
  if (!think.isString(name)) {
    return name;
  }
  if (think._aliasExport[name]) {
    return think._aliasExport[name];
  }
  if (think._alias[name]) {
    think._aliasExport[name] = require(think._alias[name]);
    return think._aliasExport[name];
  }
  if (flag) {
    return;
  }
  var obj = think.safeRequire(name);
  if (think.isFunction(obj)) {
    obj.prototype.__filename = name;
  }
  think._aliasExport[name] = obj;
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
think.log = function(msg/*, type*/){
  if (think.isError(msg)) {
    console.log(msg.stack);
    return;
  }
  console.log(msg);
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
  data = data || think._config;
  // get all config
  // think.config();
  if (name === undefined) {
    return data;
  }
  // merge config
  // think.config({name: 'welefen'})
  else if (think.isObject(name)) {
    think.extend(data, name);
  }
  // set or get config
  else if(think.isString(name)){
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
 * modules config
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
    rootPath = think.getModulePath(module) + '/' + think.dirname.config;
  }
  //config.js
  var file = rootPath + '/config.js';
  var config = think.safeRequire(file);
  //mode
  file = rootPath + '/' + think.mode + '.js';
  var modeConfig = think.safeRequire(file);
  config = think.extend({}, config, modeConfig);
  if (think.debug) {
    //debug.js
    file = rootPath + '/debug.js';
    config = think.extend(config, think.safeRequire(file));
  }
  if (!module || module === true) {
    think._moduleConfig[module] = config;
  }else{
    think._moduleConfig[module] = think.extend({}, think._config, config);
  }
  return think._moduleConfig[module];
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
  //get hook data
  if (arguments.length === 1) {
    return think._hook[name] || [];
  }
  //set hook data
  else if (think.isArray(http)) {
    think._hook[name] = http;
    return;
  }
  var list = think._hook[name] || [];
  var index = 0, length = list.length;
  if (length === 0) {
    return Promise.resolve(data);
  }
  http = http || {};
  http._middleware = data;
  function execMiddleware(){
    if (index >= length) {
      return Promise.resolve(http._middleware);
    }
    var item = list[index++];
    return think.middleware(item, http, http._middleware).then(function(data){
      if (data !== undefined) {
        http._middleware = data;
      }
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
think._middleware = {};
think.middleware = function(superClass, props, data){
  var length = arguments.length;
  var prefix = 'middleware_';
  // register functional middleware
  // think.middleware('parsePayLoad', function(){})
  if (think.isString(superClass) && think.isFunction(props)) {
    think._middleware[superClass] = props;
    return;
  }
  // exec middleware
  // think.middleware('parsePayLoad', http, data)
  if (length >= 2 && props && props.req && props.res) {
    var name = superClass, http = props;
    if (name in think._middleware) {
      var fn = think._middleware[name];
      return think.co.wrap(fn)(http, data);
    }else if (think.isString(name)) {
      var instance = think.require(prefix + name)(http);
      return think.co.wrap(instance.run).bind(instance)(data);
    }else if (think.isFunction(name)){
      return think.co.wrap(name)(http, data);
    }
  }
  // get middleware
  // think.middleware('parsePayLoad')
  if (length === 1 && think.isString(superClass)) {
    var cls = think.require(prefix + superClass, true);
    if (cls) {
      return cls;
    }
    throw new Error(think.message('MIDDLEWARE_NOT_FOUND', superClass));
  }
  if (!middleware) {
    middleware = think.Class('middleware');
  }
  // create middleware
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

  var length = arguments.length, key = 'adapter_';
  //register adapter
  //think.adapter('session', 'redis', function(){})
  if (length === 3 && think.isFunction(fn)) {
    key += type + '_' + name;
    think._aliasExport[key] = fn;
    return;
  }
  //get adapter
  //think.adapter('session', 'redis')
  if (length === 2 && think.isString(name)) {
    key += type + '_' + name;
    var cls = think.require(key, true);
    if (cls) {
      return cls;
    }
    throw new Error(think.message('ADAPTER_NOT_FOUND', key));
  }
  //create adapter
  //module.exports = think.adapter({})
  //module.exports = think.adapter(function(){}, {});
  var superClass;
  if (think.isFunction(type)) {
    superClass = type;
  }else if (think.isString(type)) {
    superClass = think.require(type, true) || think.Base;
  }
  //create clean Class
  if (!superClass) {
    return think.Class(type, true);
  }
  return think.Class(superClass, name);
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
think.alias = function(type, paths, slash){
  //regist alias
  if (!think.isArray(paths)) {
    paths = [paths];
  }
  paths.forEach(function(path){
    var files = think.getFiles(path);
    files.forEach(function(file){
      var name = file.slice(0, -3);
      name = type + (slash ? '/' : '_') + name;
      think._alias[name] = path + '/' + file;
    })
  })
}
/**
 * route list
 * @type {Array}
 */
think._route = null;
/**
 * load route
 * @return {} []
 */
think.route = function(clear){
  if (clear) {
    //clear route
    if (clear === true) {
      think._route = null;
    }
    //set route
    else if (think.isArray(clear)) {
      think._route = clear;
    }
    return;
  }
  if (think._route !== null) {
    return think._route;
  }
  var file = think.getModulePath() + '/' + think.dirname.config + '/route.js';
  var config = think.safeRequire(file);
  //route config is funciton
  //may be is dynamic save in db
  if (think.isFunction(config)) {
    var fn = think.co.wrap(config);
    return fn().then(function(route){
      think._route = route || [];
      return think._route;
    })
  }
  think._route = config || [];
  return think._route;
}
/**
 * thinkjs timer list
 * @type {Object}
 */
think.timer = {};
/**
 * regist gc
 * @param  {Object} instance [class instance]
 * @return {}          []
 */
think.gc = function(instance){
  if (!instance || !instance.gcType) {
    throw new Error(think.message('GCTYPE_MUST_SET'));
  }
  var type = instance.gcType;
  if (think.debug || think.mode === 'cli' || type in think.timer) {
    return;
  }
  think.timer[type] = setInterval(function(){
    var hour = (new Date()).getHours();
    var hours = think._config.cache_gc_hour || [];
    if (hours.indexOf(hour) === -1) {
      return;
    }
    return instance.gc && instance.gc(Date.now());
  }, 3600 * 1000);
}
/**
 * local ip
 * @type {String}
 */
think.localIp = '127.0.0.1';
/**
 * get http object
 * @param  {Object} req [http request]
 * @param  {Object} res [http response]
 * @return {Object}     [http object]
 */
var http;
think.http = function(req, res){
  if (!http) {
    http = think.require('http');
  }
  //for cli request
  if (arguments.length === 1) {
    var data = req;
    data = data || {};
    if (think.isString(data)) {
      if (data[0] === '{') {
        data = JSON.parse(data);
      }else if (/^[\w]+\=/.test(data)) {
        data = querystring.parse(data);
      }else{
        data = {url: data};
      }
    }
    var url = data.url || '';
    if (url.indexOf('/') !== 0) {
      url = '/' + url;
    }
    req = {
      httpVersion: '1.1',
      method: (data.method || 'GET').toUpperCase(),
      url: url,
      headers: think.extend({
        host: data.host || think.localIp
      }, data.headers),
      connection: {
        remoteAddress: data.ip || think.localIp
      }
    }
    res = {
      end: data.end || data.close || function(){},
      write: data.write || data.send || function(){},
      setHeader: function(){}
    }
  }
  return http(req, res).run();
}
/**
 * get uuid
 * @param  {Number} length [uid length]
 * @return {String}        []
 */
think.uuid = function(length){
  length = length || 32;
  var str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
  return str.replace(/[\+\/]/g, '_');
}
/**
 * start session
 * @param  {Object} http []
 * @return {}      []
 */
var Cookie;
think.session = function(http){
  if (http.session) {
    return http.session;
  }
  if (!Cookie) {
    Cookie = think.require('cookie');
  }
  var sessionOptions = think.config('session');
  var name = sessionOptions.name;
  var sign = sessionOptions.sign;
  var cookie = http._cookie[name];
  //validate cookie sign
  if (cookie && sign) {
    cookie = Cookie.unsign(cookie, sign);
    //set unsigned cookie to http._cookie
    if (cookie) {
      http._cookie[name] = cookie;
    }
  }
  var sessionCookie = cookie;
  if (!cookie) {
    var options = sessionOptions.cookie || {};
    cookie = think.uuid(options.length || 32);
    sessionCookie = cookie;
    //sign cookie
    if (sign) {
      cookie = Cookie.sign(cookie, sign);
    }
    http._cookie[name] = sessionCookie;
    http.cookie(name, cookie, options);
  }
  var type = sessionOptions.type;
  type = type || 'base';
  if (type === 'base') {
    if (think.debug || think.config('cluster_on')) {
      type = 'file';
      think.log("in debug or cluster mode, session can't use memory for storage, convert to File");
    }
  }
  var session = think.adapter('session', type)({
    cookie: sessionCookie,
    timeout: sessionOptions.timeout
  });
  http.session = session;
  http.on('afterEnd', function(){
    //stor session data
    return session.flush && session.flush();
  })
  return session;
}
/**
 * get module name
 * @param  {String} module []
 * @return {String}        []
 */
think.getModule = function(module){
  if (!module) {
    return think.config('default_module')
  }
  return module.toLowerCase();
}

var nameReg = /^[A-Za-z\_]\w*$/;
think.getController = function(controller){
  if (!controller) {
    return think.config('default_controller');
  }
  if (nameReg.test(controller)) {
    return controller.toLowerCase();
  }
  return '';
}
/**
 * get action
 * @param  {String} action [action name]
 * @return {String}        []
 */
think.getAction = function(action){
  if (!action) {
    return think.config('default_action');
  }
  if (nameReg.test(action)) {
    return action;
  }
  return '';
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
think.logic = think.Class('logic');
/**
 * create model sub class
 * @type {Function}
 */
think.model = think.Class('model');
//model relation type
think.model.HAS_ONE = 1;
think.model.BELONG_TO = 2;
think.model.HAS_MANY = 3;
think.model.MANY_TO_MANY = 4;
/**
 * create service sub class
 * @type {Function}
 */
think.service = think.Class('service');
/**
 * get error message
 * @param  {String} type [error type]
 * @param  {Array} data []
 * @return {}      []
 */
think.message = function(type, data){
  if (!think.isArray(data)) {
    data = [].slice.call(arguments, 1);
  }
  var msg = think._message[type];
  if (!msg) {
    return;
  }
  data.unshift(msg);
  return util.format.apply(util, data);
}
/**
 * get or set cache
 * @param  {String} type  [cache type]
 * @param  {String} name  [cache name]
 * @param  {Mixed} value [cache value]
 * @return {}       []
 */
think.cache = function(name, value, options){
  options = options || {};
  var type = options.type || 'base';
  var instance = think.adapter('cache', type)(options);
  var isFn = think.isFunction(instance.__before);
  var promise = Promise.resolve(isFn ? instance.__before(name) : undefined);
  return promise.then(function(){
    //get cache
    if (value === undefined) {
      return instance.get(name);
    }
    //remove cache
    else if (value === null) {
      return instance.rm(name);
    }
    //set cache
    return instance.set(name, value);
  })
}



/**
 * global cache
 * @type {Object}
 */
global.thinkCache = function(type, name, value){
  type = '_' + type;
  if (!(type in thinkCache)) {
    thinkCache[type] = {};
  }
  if (name === undefined) {
    return thinkCache[type];
  }else if (value === undefined) {
    if (think.isString(name)) {
      return thinkCache[type][name];
    }
    thinkCache[type] = name;
    return;
  }else if (value === null) {
    delete thinkCache[type][name];
    return;
  }
  thinkCache[type][name] = value;
};
//cache key
thinkCache.BASE = 'base';
thinkCache.TEMPLATE = 'template';
thinkCache.DB = 'db';
thinkCache.SESSION = 'session';
thinkCache.REDIS = 'redis';
thinkCache.MEMCACHE = 'memcache';
thinkCache.FILE = 'file';