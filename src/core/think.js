'use strict';

import fs from 'fs';
import path from 'path';
import util from 'util';
import crypto from 'crypto';
import querystring from 'querystring';
import child_process from 'child_process';

import thinkit from 'thinkit';
import co from 'co';
import colors from 'colors/safe';

import base from './base.js';
import {} from './_cache.js';

/**
 * global think variable
 * @type {Object}
 */
global.think = Object.create(thinkit);
/**
 * server start time
 * @type {Number}
 */
think.startTime = Date.now();
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
};
/**
 * debug
 * @type {Boolean}
 */
think.debug = false;
/**
 * env
 * env | test | online
 * @type {String}
 */
think.env = 'dev';
/**
 * server port
 * @type {Number}
 */
think.port = 0;
/**
 * is command line
 * @type {String}
 */
think.cli = false;
/**
 * get platform language
 * @type {String}
 */
think.lang = (process.env.LANG || '').split('.')[0].replace('_', '-');
/**
 * app mode
 * 0x0001: mini
 * 0x0002: normal
 * 0x0004: module
 * @type {Boolean}
 */
think.mode = 0x0001;
//mini mode, no module
think.mode_mini = 0x0001;
//normal mode
think.mode_normal = 0x0002;
//module mode
think.mode_module = 0x0004;
/**
 * thinkjs module lib path
 * @type {String}
 */
think.THINK_LIB_PATH = path.normalize(`${__dirname}/../`);
/**
 * thinkjs module root path
 * @type {String}
 */
think.THINK_PATH = path.dirname(think.THINK_LIB_PATH);
/**
 * thinkjs version
 * @param  {) []
 * @return {}         []
 */
think.version = (() => {
  let packageFile = `${think.THINK_PATH}/package.json`;
  let {version} = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
  return version;
})();
/**
 * module list
 * @type {Array}
 */
think.module = [];
/**
 * base class
 * @type {Class}
 */
think.base = base;
/**
 * get deferred object
 * @return {Object} []
 */
think.defer = () => {
  let deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};
/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
think.promisify = (fn, receiver) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) =>  {
        if (err) return reject(err);
        resolve(res);
      }]);
    });
  }
};
/**
 * [description]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
think.reject = (err) => {
  //delay to show error
  setTimeout(() => {
    think.log(err);
  }, 500);
  return Promise.reject(err);
};

/**
 * check object is http object
 * @param  {Mixed}  obj []
 * @return {Boolean}      []
 */
think.isHttp = obj => {
  return !!(obj && think.isObject(obj.req) && think.isObject(obj.res));
};

/**
 * alias co module to think.co
 * @type {Object}
 */
think.co = co;
/**
 * create class
 * @param {Object} methods [methods and props]
 */
let Class = think.Class;
think.Class = (type, clean) => {
  // create class
  // think.Class({})
  // think.Class({}, true)
  if (think.isObject(type)) {
    return clean === true ? Class(type) : Class(think.base, type);
  }
  // create class with superClass
  // think.Class(function(){}, {})
  else if (think.isFunction(type)) {
    return Class(type, clean);
  }

  //create type class
  return (superClass, methods) => {
    // think.controller();
    // think.controller({})
    if (think.isObject(superClass) || !superClass) {
      methods = superClass;
      superClass = type + '_base';
    }
    // think.controller('superClass', {})
    else if (think.isString(superClass)) {
      superClass = think.lookClass(superClass, type);
    }
    if (think.isString(superClass)) {
      superClass = think.require(superClass, true);
      // get class
      // think.controller('rest')
      if (!methods) {
        return superClass;
      }
    }
    return Class(superClass, methods);
  };
};
/**
 * look up class
 * @param  {String} type   [class type, model, controller, service]
 * @param  {String} module [module name]
 * @return {String}        []
 */
think.lookClass = (name, type, module, base) => {
  let names = name.split('/');
  switch(names.length){
    // home/controller/base
    case 3:
      return think.require(name);
    // home/base
    case 2:
      return think.require(`${names[0]}/${type}/${names[1]}`);
    // base
    case 1:
      let clsPath, cls;
      // find from current module
      if (module) {
        clsPath = `${module}/${type}/${name}`;
        cls = think.require(clsPath, true);
        if (cls) {
          return cls;
        }
      }
      // find from common module
      module = think.mode !== think.mode_module ? think.config('default_module') : think.dirname.common;
      let list = [
        `${module}/${type}/${name}`,
        `${type}_${name}`,
        base || `${type}_base`
      ];
      list.some(item => cls = think.require(item, true));
      return cls;
  }
};
/**
 * get common module path
 * think.getPath(undefined, think.dirname.controller)
 * think.getPath(home, think.dirname.model)
 * @return {String} []
 */
think.getPath = (module, type = think.dirname.controller) => {
  switch(think.mode){
    case think.mode_mini:
      return `${think.APP_PATH}/${type}`;
    case think.mode_normal:
      let filepath = `${think.APP_PATH}/${type}`;
      switch(type){
        case think.dirname.controller:
        case think.dirname.model:
        case think.dirname.logic:
        case think.dirname.service:
        case think.dirname.view:
          module = module || think.config('default_module');
          filepath += '/' + module;
          break;
      }
      return filepath;
    case think.mode_module:
      module = module || think.dirname.common;
      return `${think.APP_PATH}/${module}/${type}`;
  }
};

/**
 * require module
 * @param  {String} name []
 * @return {mixed}      []
 */
think.require = (name, flag) => {
  if (!think.isString(name)) {
    return name;
  }
  // adapter or middle by register
  let Cls = thinkCache(thinkCache.ALIAS_EXPORT, name);
  if (Cls) {
    return Cls;
  }

  let load = (name, filepath) => {
    let obj = think.safeRequire(filepath);
    if (think.isFunction(obj)) {
      obj.prototype.__filename = filepath;
    }
    if(obj){
      thinkCache(thinkCache.ALIAS_EXPORT, name, obj);
    }
    return obj;
  };

  let filepath = thinkCache(thinkCache.ALIAS, name);
  if (filepath) {
    return load(name, filepath);
  }
  // only check in alias
  if (flag) {
    return null;
  }
  filepath = require.resolve(name);
  return load(name, filepath);
};
/**
 * safe require
 * @param  {String} file []
 * @return {mixed}      []
 */
think.safeRequire = file => {
  // absolute file path is not exist
  if (path.isAbsolute(file) && !think.isFile(file)) {
    return null;
  }
  try{
    return require(file);
  }catch(err){
    think.log(err);
  }
  return null;
};
/**
 * prevent next process
 * @return {Promise} []
 */
let preventMessage = 'PREVENT_NEXT_PROCESS';
think.prevent = () => {
  let err = new Error(preventMessage);
  return Promise.reject(err);
};
/**
 * check is prevent error
 * @param  {Error}  err [error message]
 * @return {Boolean}     []
 */
think.isPrevent = err => {
  return think.isError(err) && err.message === preventMessage;
};
/**
 * log
 * @TODO
 * @return {} []
 */
think.log = (msg, type, startTime) => {

  let fn = d => {
    return ('0' + d).slice(-2);
  };

  let d = new Date();
  let date = `${d.getFullYear()}-${fn(d.getMonth() + 1)}-${fn(d.getDate())}`;
  let time = `${fn(d.getHours())}:${fn(d.getMinutes())}:${fn(d.getSeconds())}`;
  let dateTime = colors.green(`[${date} ${time}] `);

  let preError = thinkCache(thinkCache.COLLECTION, 'prev_error');
  if (think.isError(msg)) {
    if(think.isPrevent(msg) || msg === preError){
      return;
    }
    thinkCache(thinkCache.COLLECTION, 'prev_error', msg);
    console.error(dateTime + colors.red('[Error] ') + msg.message);
    return;
  }else if(think.isFunction(msg)){
    msg = msg(colors);
  }
  if(msg.length > 100){
    msg = msg.substr(0, 100) + '...';
  }
  if(startTime){
    let time = Date.now() - startTime;
    msg += ' ' + colors.green(`${time}ms`);
  }
  if(type){
    console.log(dateTime + colors.cyan(`[${type}] `) + msg);
  }else{
    console.log(dateTime + msg); 
  }
};

/**
 * get or set config
 * @return {mixed} []
 */
think.config = (name, value, data = thinkCache(thinkCache.CONFIG)) => {
  //get module config
  if(think.isString(data)){
    data = think.getModuleConfig(data);
  }
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
};
/**
 * get module config
 * @param  {String} module []
 * @return {Object}        []
 */
think.getModuleConfig = (module = think.dirname.common) => {
  let moduleConfig = thinkCache(thinkCache.MODULE_CONFIG);
  if (!think.debug && module in moduleConfig) {
    return moduleConfig[module];
  }
  let rootPath;
  //get sys config
  if (module === true) {
    rootPath = `${think.THINK_LIB_PATH}/config`;
  }else{
    rootPath = think.getPath(module, think.dirname.config);
  }
  //config.js
  let config = think.safeRequire(`${rootPath}/config.js`);
  let debugConfig = {}, cliConfig = {}, extraConfig = {};
  //debug.js
  if (think.debug) {
    debugConfig = think.safeRequire(`${rootPath}/debug.js`);
  }
  //load extra config by key
  if(think.isDir(rootPath)){
    let filters = ['config', 'debug', 'cli', 'route'];
    if(module === true){
      filters.push('alias', 'hook', 'transform', 'error');
    }
    //load conf
    let loadConf = (path, extraConfig) => {
      fs.readdirSync(path).forEach(item => {
        if(think.isDir(`${path}/${item}`)){
          extraConfig[item] = loadConf(`${path}/${item}`, extraConfig[item] || {});
        }
        item = item.slice(0, -3);
        if(item[0] === '_' || filters.indexOf(item) > -1){
          return;
        }
        let conf = think.safeRequire(`${path}/${item}.js`);
        if(conf){
          extraConfig = think.extend(extraConfig, {[item]: conf});
        }
      });
      return extraConfig;
    };
    extraConfig = loadConf(rootPath, extraConfig);
  }
  //cli.js
  if(think.cli){
    cliConfig = think.safeRequire(`${rootPath}/cli.js`);
  }
  config = think.extend({}, config, debugConfig, extraConfig, cliConfig);
  //merge config
  if (module !== true) {
    config = think.extend({}, thinkCache(thinkCache.CONFIG), config);
  }
  //transform config
  let transforms = require(`${think.THINK_LIB_PATH}/config/transform.js`);
  config = think.transformConfig(config, transforms);
  thinkCache(thinkCache.MODULE_CONFIG, module, config);
  return config;
};
/**
 * transform config
 * @param  {Object} config []
 * @return {Object}        []
 */
think.transformConfig = (config, transforms) => {
  for(let key in transforms){
    if (!(key in config)) {
      continue;
    }
    let value = transforms[key];
    if (think.isFunction(value)) {
      config[key] = value(config[key]);
    }else {
      config[key] = think.transformConfig(config[key], value);
    }
  }
  return config;
};
/**
 * exec hook
 * @param  {String} name []
 * @return {}      []
 */
think.hook = (...args) => {
  let [name, http = {}, data] = args;
  //get hook data
  if (args.length === 1) {
    return thinkCache(thinkCache.HOOK, name) || [];
  }
  // set hook data
  // think.hook('test', ['middleware1', 'middleware2'])
  else if(think.isArray(http)){
    if(data !== 'append' && data !== 'prepend'){
      thinkCache(thinkCache.HOOK, name, []);
    }
    http.forEach(item => {
      think.hook(name, item, data);
    });
    return;
  }
  //remove hook
  else if(http === null){
    thinkCache(thinkCache.HOOK, name, []);
    return;
  }
  //set hook data
  else if (!think.isHttp(http)){
    // think.hook('test', function or class);
    if(think.isFunction(http)){
      let name = 'middleware_' + think.uuid();
      think.middleware(name, http);
      http = name;
    }
    let hooks = thinkCache(thinkCache.HOOK, name) || [];
    if(data === 'append'){
      hooks.push(http);
    }else if(data === 'prepend'){
      hooks.unshift(http);
    }else{
      hooks = [http];
    }
    thinkCache(thinkCache.HOOK, name, hooks);
    return;
  }

  //exec hook 
  let list = thinkCache(thinkCache.HOOK, name) || [];
  let length = list.length;
  if (length === 0) {
    return Promise.resolve(data);
  }
  http._middleware = data;

  //exec middleware
  let execMiddleware = async () => {
    for(let i = 0; i < length; i++){
      let data = await think.middleware(list[i], http, http._middleware);
      if (data !== undefined) {
        http._middleware = data;
      }
    }
    return http._middleware;
  };

  return execMiddleware();
};
/**
 * create or exec middleware
 * @param  {Function} superClass []
 * @param  {Object} methods      []
 * @return {mixed}            []
 */
think.middleware = (...args) => {
  let [superClass, methods, data] = args;
  let length = args.length;
  let prefix = 'middleware_';

  let middlwares = thinkCache(thinkCache.MIDDLEWARE);
  // register functional or class middleware
  // think.middleware('parsePayLoad', function(){})
  if (think.isString(superClass) && think.isFunction(methods)) {
    thinkCache(thinkCache.MIDDLEWARE, superClass, methods);
    return;
  }
  // exec middleware
  // think.middleware('parsePayLoad', http, data)
  if (length >= 2 && think.isHttp(methods)) {
    let name = superClass, http = methods;
    if (think.isString(name)) {
      // name is in middleware cache
      if (name in middlwares) {
        let fn = middlwares[name];
        //class middleware must have run method
        if(think.isFunction(fn.prototype.run)){
          let instance = new fn(http);
          return think.co.wrap(instance.run).bind(instance)(data);
        }else{
          return think.co.wrap(fn)(http, data);
        }
      }else{
        let Cls = think.require(prefix + name, true);
        if(Cls){
          let instance = new Cls(http);
          return think.co.wrap(instance.run).bind(instance)(data);
        }
        let err = new Error(think.local('MIDDLEWARE_NOT_FOUND', name));
        return Promise.reject(err);
      }
    }
    else if (think.isFunction(name)){
      return think.co.wrap(name)(http, data);
    }
  }
  // get middleware
  // think.middleware('parsePayLoad')
  if (length === 1 && think.isString(superClass)) {
    if(superClass in middlwares){
      return middlwares[superClass];
    }
    let cls = think.require(prefix + superClass, true);
    if (cls) {
      return cls;
    }
    throw new Error(think.local('MIDDLEWARE_NOT_FOUND', superClass));
  }
  let middleware = thinkCache(thinkCache.COLLECTION, 'middleware');
  if (!middleware) {
    middleware = think.Class('middleware');
    thinkCache(thinkCache.COLLECTION, 'middleware', middleware);
  }
  // create middleware
  return middleware(superClass, methods);
};

/**
 * create, register, call adapter
 * @param  {String} name []
 * @return {void}      []
 */
think.adapter = (...args) => {
  let [type, name, fn] = args;

  let length = args.length, key = 'adapter_';
  if(length === 3){
    //register adapter
    //think.adapter('session', 'redis', function(){})
    if (think.isFunction(fn)) {
      key += `${type}_${name}`;
      thinkCache(thinkCache.ALIAS_EXPORT, key, fn);
      return;
    }
    //create adapter
    //module.exports = think.adapter('session', 'base', {})
    else if(think.isObject(fn)){
      return think.Class(think.adapter(type, name), fn);
    }
  }
  //type has not _
  else if(length === 2 && think.isString(type) && type.indexOf('_') === -1){
    //create adapter
    //module.exports = think.adapter('session', {})
    if(think.isObject(name)){
      return think.Class(think.adapter(type, 'base'), name);
    }
    //get adapter
    //think.adapter('session', 'redis')
    else if (think.isString(name)) {
      key += type + '_' + name;
      let cls = think.require(key, true);
      if (cls) {
        return cls;
      }else{
        think.loadAdapter(type, name);
        let cls = think.require(key, true);
        if(cls){
          return cls;
        }
      }
      throw new Error(think.local('ADAPTER_NOT_FOUND', key));
    }
  }
  
  //create adapter
  //module.exports = think.adapter({})
  //module.exports = think.adapter(function(){}, {});
  let superClass;
  if (think.isFunction(type)) {
    superClass = type;
  }else if (think.isString(type)) {
    superClass = think.require(type);
  }
  //create clean Class
  if (!superClass) {
    return think.Class(type, true);
  }
  return think.Class(superClass, name);
};
/**
 * load system & comon module adapter
 * @return {} []
 */
think.loadAdapter = (type, name = 'base') => {
  let paths = [`${think.THINK_LIB_PATH}/adapter`];
  //common module adapter
  let adapterPath = think.getPath(undefined, think.dirname.adapter);
  if (think.isDir(adapterPath)) {
    paths.push(adapterPath);
  }
  paths.forEach(path => {
    if(type){
      let filepath = `${path}/${type}/${name}.js`;
      if(think.isFile(filepath)){
        thinkCache(thinkCache.ALIAS, `adapter_${type}_${name}`, filepath);
      }
    }else{
      let dirs = fs.readdirSync(path);
      dirs.forEach(dir => {
        think.alias(`adapter_${dir}`, `${path}/${dir}`);
        //adapter type base class
        let cls = think.require(`adapter_${dir}_base`, true);
        if(cls){
          think.adapter[dir] = cls;
        }
      });
    }
  });
};

/**
 * load alias
 * @param  {String} type  []
 * @param  {Array} paths []
 * @return {Object}       []
 */
think.alias = (type, paths, slash) => {
  if(!type){
    return thinkCache(thinkCache.ALIAS);
  }
  //regist alias
  if (!think.isArray(paths)) {
    paths = [paths];
  }
  paths.forEach(path => {
    let files = think.getFiles(path);
    files.forEach(file => {
      if(file.slice(-3) !== '.js' || file[0] === '_'){
        return;
      }
      let name = file.slice(0, -3);
      name = type + (slash ? '/' : '_') + name;
      thinkCache(thinkCache.ALIAS, name, `${path}/${file}`);
    });
  });
};
/**
 * load route
 * route detail config
 *
 * module.exports = {
 *   admin: {
 *     reg: /^admin/, //module reg
 *     children: [
 *       /^admin\/reg/, 'admin/index/reg'
 *     ]
 *   },
 *   home: {
 *     children: [
 *       
 *     ]
 *   }
 * }
 * 
 * @return {} []
 */
think.route = routes => {
  let key = 'route';
  if(routes === null){
    thinkCache(thinkCache.COLLECTION, key, null);
    return;
  }
  //set route
  else if (think.isArray(routes) || think.isObject(routes)) {
    thinkCache(thinkCache.COLLECTION, key, routes);
    return;
  }
  routes = thinkCache(thinkCache.COLLECTION, key);
  if (routes) {
    return routes;
  }
  let file = think.getPath(undefined, think.dirname.config) + '/route.js';
  let config = think.safeRequire(file) || [];

  //route config is funciton
  //may be is dynamic save in db
  if (think.isFunction(config)) {
    return think.await('route', () => {
      let fn = think.co.wrap(config);
      return fn().then((route = []) => {
        thinkCache(thinkCache.COLLECTION, key, route);
        return route;
      });
    });
  }
  //get module route config
  else if(think.isObject(config) && think.mode === think.mode_module){
    for(let module in config){
      let filepath = think.getPath(module, think.dirname.config) + '/route.js';
      let moduleConfig = think.safeRequire(filepath);
      config[module].children = moduleConfig || [];
    }
  }
  thinkCache(thinkCache.COLLECTION, key, config);
  return config;
};
/**
 * regist gc
 * @param  {Object} instance [class instance]
 * @return {}          []
 */
think.gc = instance => {
  let type = instance.gcType;
  let timers = thinkCache(thinkCache.TIMER);
  let gc = think.config('gc');
  if (!gc.on || type in timers) {
    return;
  }
  let timer = setInterval(() => {
    if(gc.filter()){
      return instance.gc && instance.gc(Date.now());
    }
  }, gc.interval * 1000);
  thinkCache(thinkCache.TIMER, type, timer);
};
/**
 * get http object
 * @param  {Object} req [http request]
 * @param  {Object} res [http response]
 * @return {Object}     [http object]
 */

think._http = (data = {}) => {
  if (think.isString(data)) {
    if (data[0] === '{') {
      data = JSON.parse(data);
    }else if (/^\w+\=/.test(data)) {
      data = querystring.parse(data);
    }else{
      data = {url: data};
    }
  }
  let url = data.url || '';
  if (url.indexOf('/') !== 0) {
    url = '/' + url;
  }
  let req = {
    httpVersion: '1.1',
    method: (data.method || 'GET').toUpperCase(),
    url: url,
    headers: think.extend({
      host: data.host || '127.0.0.1'
    }, data.headers),
    connection: {
      remoteAddress: data.ip || '127.0.0.1'
    }
  };
  let empty = () => {};
  let res = {
    setTimeout: empty,
    end: data.end || data.close || empty,
    write: data.write || data.send || empty,
    setHeader: empty
  };
  return {
    req: req,
    res: res
  };
};

think.http = (req, res) => {
  let Http = thinkCache(thinkCache.COLLECTION, 'http');
  if (!Http) {
    Http = think.require('http');
    thinkCache(thinkCache.COLLECTION, 'http', Http);
  }
  //for cli request
  if (res === undefined) {
    ({req, res} = think._http(req));
  }
  let instance = new Http(req, res);
  return instance.run();
};
/**
 * get uuid
 * @param  {Number} length [uid length]
 * @return {String}        []
 */
think.uuid = (length = 32) => {
  // length = length || 32;
  let str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
  return str.replace(/[\+\/]/g, '_');
};
/**
 * start session
 * @param  {Object} http []
 * @return {}      []
 */
think.session = http => {
  if (http.session) {
    return http.session;
  }
  let Cookie = thinkCache(thinkCache.COLLECTION, 'cookie');
  if (!Cookie) {
    Cookie = think.require('cookie');
    thinkCache(thinkCache.COLLECTION, 'cookie', Cookie);
  }
  let sessionOptions = think.config('session');
  let {name, sign} = sessionOptions;
  let cookie = http._cookie[name];
  //validate cookie sign
  if (cookie && sign) {
    cookie = Cookie.unsign(cookie, sign);
    //set cookie to http._cookie
    if (cookie) {
      http._cookie[name] = cookie;
    }
  }
  let sessionCookie = cookie;
  if (!cookie) {
    let options = sessionOptions.cookie || {};
    cookie = think.uuid(options.length || 32);
    sessionCookie = cookie;
    //sign cookie
    if (sign) {
      cookie = Cookie.sign(cookie, sign);
    }
    http._cookie[name] = sessionCookie;
    http.cookie(name, cookie, options);
  }
  let type = sessionOptions.type || 'base';
  if (type === 'base') {
    if (think.debug || think.config('cluster_on')) {
      type = 'file';
      think.log('in debug or cluster mode, session can\'t use memory for storage, convert to File');
    }
  }
  let cls = think.adapter('session', type);
  let conf = think.extend({}, sessionOptions, {cookie: sessionCookie});
  let session = new cls(conf);
  http.session = session;
  http.on('afterEnd', () => session.flush && session.flush());
  return session;
};
/**
 * get module name
 * @param  {String} module []
 * @return {String}        []
 */
think.getModule = module => {
  if (!module || think.mode === think.mode_mini) {
    return think.config('default_module');
  }
  return module.toLowerCase();
};

let nameReg = /^[A-Za-z\_]\w*$/;
/**
 * get controller name
 * @param  {String} controller []
 * @return {String}            []
 */
think.getController = controller => {
  if (!controller) {
    return think.config('default_controller');
  }
  if (nameReg.test(controller)) {
    return controller.toLowerCase();
  }
  return '';
};
/**
 * get action
 * @param  {String} action [action name]
 * @return {String}        []
 */
think.getAction = action => {
  if (!action) {
    return think.config('default_action');
  }
  if (nameReg.test(action)) {
    return action;
  }
  return '';
};
/**
 * create controller sub class
 * @type {Function}
 */
think.controller = (superClass, methods, module) => {
  let isConfig = think.isHttp(methods) || module;
  // get controller instance
  if (think.isString(superClass) && isConfig) {
    let Cls = think.lookClass(superClass, 'controller', module);
    return new Cls(methods);
  }
  let controller = thinkCache(thinkCache.COLLECTION, 'controller');
  if(!controller){
    controller = think.Class('controller');
    thinkCache(thinkCache.COLLECTION, 'controller', controller);
  }
  //create sub controller class
  return controller(superClass, methods);
};
/**
 * create logic class
 * @type {Function}
 */
think.logic = (superClass, methods, module) => {
  let isConfig = think.isHttp(methods) || module;
  //get logic instance
  if (think.isString(superClass) && isConfig) {
    let Cls = think.lookClass(superClass, 'logic', module);
    return new Cls(methods);
  }
  let logic = thinkCache(thinkCache.COLLECTION, 'logic');
  if(!logic){
    logic = think.Class('logic');
    thinkCache(thinkCache.COLLECTION, 'logic', logic);
  }
  //create sub logic class
  return logic(superClass, methods);
};
/**
 * create model sub class
 * @type {Function}
 */
think.model = (superClass, methods, module) => {
  let isConfig = !!module;
  if (!isConfig && methods) {
    //check is db configs
    if ('host' in methods && 'type' in methods) {
      isConfig = true;
    }
  }
  //get model instance
  if (think.isString(superClass) && isConfig) {
    methods = think.extend({}, think.config('db'), methods);
    let base = methods.type === 'mongo' ? 'model_mongo' : '';
    let cls = think.lookClass(superClass, 'model', module, base);
    return new cls(superClass, methods);
  }
  let model = thinkCache(thinkCache.COLLECTION, 'model');
  if(!model){
    model = think.Class('model');
    thinkCache(thinkCache.COLLECTION, 'model', model);
  }
  //create model
  return model(superClass, methods);
};
//model relation type
think.model.HAS_ONE = 1;
think.model.BELONG_TO = 2;
think.model.HAS_MANY = 3;
think.model.MANY_TO_MANY = 4;

/**
 * create service sub class
 * @type {Function}
 */
think.service = (superClass, methods, module) => {
  let isConfig = think.isHttp(methods) || module;
  //get service instance
  if (think.isString(superClass) && isConfig) {
    let Cls = think.lookClass(superClass, 'service', module);
    if (think.isFunction(Cls)) {
      return new Cls(methods);
    }
    return Cls;
  }
  let service = thinkCache(thinkCache.COLLECTION, 'service');
  if(!service){
    service = think.Class('service');
    thinkCache(thinkCache.COLLECTION, 'service', service);
  }
  //create sub service class
  return service(superClass, methods);
};
/**
 * get or set cache
 * @param  {String} type  [cache type]
 * @param  {String} name  [cache name]
 * @param  {Mixed} value [cache value]
 * @return {}       []
 */
think.cache = async (name, value, options = {}) => {
  let Cls = think.adapter('cache', options.type || 'base');
  let instance = new Cls(options);
  // get cache
  if(value === undefined){
    return instance.get(name);
  } 
  //delete cache
  else if(value === null){
    return instance.delete(name);
  } 
  //get cache waiting for function
  else if(think.isFunction(value)){
    let data = await instance.get(name);
    if(data !== undefined){
      return data;
    }
    data = await think.co.wrap(value)(name);
    await instance.set(name, data);
    return data;
  }
  //set cache
  return instance.set(name, value);
};
/**
 * get local message
 * @param  {String} key  []
 * @param  {String} lang []
 * @return {String}      []
 */
think.local = (key, ...data) => {
  let _default = think.config('local.default');
  let lang = think.lang || _default;
  let config = think.config('local');
  let value;
  if(config[lang] && config[lang][key]){
    value = config[lang][key];
  }else if(config[_default][key]){
    value = config[_default][key];
  }else{
    value = key;
  }
  data.unshift(value);
  var msg = util.format(...data);
  return msg;
};
/**
 * validate data
 * [{
 *   name: 'xxx',
 *   type: 'xxx',
 *   value: 'xxx',
 *   required: true,
 *   args: []
 *   msg: ''
 * }, ...]
 * @param  {String | Object}   name     []
 * @param  {Function} callback []
 * @return {}            []
 */
think.validate = (name, callback) => {
  let validate = thinkCache(thinkCache.VALIDATE);
  if (think.isEmpty(validate)) {
    validate = think.require('validate');
    thinkCache(thinkCache.VALIDATE, validate);
  }
  if (think.isString(name)) {
    // register valid callback
    // think.valid('test', function(){})
    if (think.isFunction(callback)) {
      thinkCache(thinkCache.VALIDATE, name, callback);
      return;
    }
    // get valid callback
    return thinkCache(thinkCache.VALIDATE, name);
  }
  // convert object to array
  if (think.isObject(name)) {
    let d = [];
    for(let key in name){
      let value = name[key];
      value.name = key;
      d.push(value);
    }
    name = d;
  }

  let msg = {};
  name.forEach(item => {
    // value required
    if (item.required) {
      if (!item.value) {
        msg[item.name] = item.required_msg || think.local('PARAMS_EMPTY', item.name);
        return;
      }
    }else{
      if (!item.value) {
        return;
      }
    }
    let type = item.type;
    //type is not set, only check data is required
    if(!type){
      return;
    }
    if(think.isString(type)){
      type = validate[item.type];
    }else if(think.isRegExp(type)){
      type = function(value){
        return item.type.test(value);
      };
    }
    if (!think.isFunction(type)) {
      throw new Error(think.local('CONFIG_NOT_FUNCTION', `${item.name} type`));
    }
    if (!think.isArray(item.args)) {
      item.args = [item.args];
    }
    item.args.unshift(item.value);
    let result = type(...item.args);
    if (!result) {
      let itemMsg = item.msg || think.local('PARAMS_NOT_VALID');
      msg[item.name] = itemMsg.replace('{name}', item.name).replace('{valud}', item.value);
    }
  });
  return msg;
};
/**
 * await 
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
think.await = (key, callback) => {
  let awaitInstance = thinkCache(thinkCache.COLLECTION, 'await_instance');
  if(!awaitInstance){
    let Await = think.require('await');
    awaitInstance = new Await();
    thinkCache(thinkCache.COLLECTION, 'await_instance', awaitInstance);
  }
  return awaitInstance.run(key, callback);
};

/**
 * install node package
 * @param  {String} pkg [package name]
 * @return {Promise}     []
 */
think.npm = (pkg) => {
  try{
    return Promise.resolve(think.require(pkg));
  } catch(e){
    let pkgWithVersion = pkg;
    //get package version
    if(pkgWithVersion.indexOf('@') === -1){
      let version = think.config('package')[pkg];
      if(version){
        pkgWithVersion += '@' + version;
      }
    }else{
      pkg = pkgWithVersion.split('@')[0];
    }
    let cmd = `npm install ${pkgWithVersion}`;
    return think.await(cmd, () => {
      let deferred = think.defer();
      think.log(`install package ${pkgWithVersion} start`, 'NPM');
      child_process.exec(cmd, {
        cwd: think.THINK_PATH
      }, err => {
        if(err){
          think.log(new Error(`install package ${pkgWithVersion} error`));
          deferred.reject(err);
        }else{
          think.log(`install package ${pkgWithVersion} finish`, 'NPM');
          deferred.resolve(think.require(pkg));
        }
      });
      return deferred.promise;
    });
  }
};
/**
 * get error
 * @param  {Error} err   []
 * @param  {String} addon []
 * @return {Error}       []
 */
think.error = (err, addon = '') => {
  if(think.isPromise(err)){
    return err.catch(err => {
      return think.reject(think.error(err, addon));
    })
  }else if(think.isError(err)){
    let message = err.message;
    let errors = thinkCache(thinkCache.ERROR);
    let key, value;
    for(key in errors){
      if(message.indexOf(key) > -1){
        value = errors[key];
        break;
      }
    }
    if(value){
      if(think.isError(addon)){
        addon.message = `${value}, ${addon.message}. http://www.thinkjs.org/doc/error.html#${key}`;
        return addon;
      }else{
        addon = addon ? `, ${addon}` : '';
        let msg = `${value}${addon}. http://www.thinkjs.org/doc/error.html#${key}`;
        return new Error(msg);
      }
    }
    return err;
  }else{
    return new Error(err);
  }
};