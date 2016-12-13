'use strict';

import fs from 'fs';
import path from 'path';
import util from 'util';
import crypto from 'crypto';
import querystring from 'querystring';
import child_process from 'child_process';
import cluster from 'cluster';

import thinkit from 'thinkit';
import co from 'co';
import colors from 'colors/safe';

import base from './base.js';
import httpBase from './http_base.js';
import Cookie from '../util/cookie.js';
import Http from './http.js';
import Await from '../util/await.js';
import Validate from './think_validate.js';
import Middleware from './think_middleware.js';
import Hook from './think_hook.js';
import Route from './think_route.js';
import Config from './think_config.js';
import Adatper from './think_adapter.js';

import './think_cache.js';
import './think_data.js';


colors.enabled = true;


/**
 * global think variable
 * @type {Object}
 */
global.think = Object.create(thinkit);
/**
 * path seperator
 * @type {String}
 */
think.sep = path.sep;
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
  locale: 'locale'
};
/**
 * env
 * development | testing | production
 * @type {String}
 */
think.env = 'development';
/**
 * server port
 * @type {Number}
 */
think.port = 0;
/**
 * is command line
 * @type {String}
 */
think.cli = '';
/**
 * get locale
 * @type {String}
 */
think.lang = (process.env.LANG || '').split('.')[0].replace('_', '-').toLowerCase();
/**
 * is master
 * @type {Boolean}
 */
think.isMaster = cluster.isMaster;
/**
 * app mode
 * 0x0001: mini
 * 0x0002: normal
 * 0x0004: module
 * @type {Boolean}
 */
think.mode = 0x0001;
//normal mode
think.mode_normal = 0x0002;
//module mode
think.mode_module = 0x0004;
/**
 * thinkjs module lib path
 * @type {String}
 */
think.THINK_LIB_PATH = path.normalize(`${__dirname}/..`);
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
 * reject promise
 * @param  {[type]} err []
 * @return {[type]}     []
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
 * validate 
 * @type {Function}
 */
think.validate = Validate;

/**
 * middleware
 * @type {Function}
 */
think.middleware = Middleware;

/**
 * hook
 * @type {Function}
 */
think.hook = Hook;

/**
 * route
 * @type {Function}
 */
think.route = Route;

/**
 * config
 * @type {Function}
 */
think.config = Config;
/**
 * get module config
 * @param  {String} module []
 * @return {Object}        []
 */
think.getModuleConfig = module => {
  return think.config(undefined, undefined, module);
};
/**
 * adapter
 * @type {Function}
 */
think.adapter = Adatper;

/**
 * alias co module to think.co
 * @type {Object}
 */
think.co = obj => {
  //optimize invoke co package
  if(obj && typeof obj.next === 'function'){
    return co(obj);
  }
  return Promise.resolve(obj);
};
think.co.wrap = co.wrap;

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
let _getClass = (name, type, module, base) => {
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
  for(let i = 0, length = list.length; i < length; i++){
    cls = think.require(list[i], true);
    if(cls){
      return cls;
    }
  }
};

think.lookClass = (name, type, module, base) => {
  let names = name.split('/');
  let length = names.length;
  if(length === 1){
    return _getClass(name, type, module, base);
  }
  if(length === 2 && (think.module.indexOf(names[0]) > -1 || !module)){
    return think.require(`${names[0]}/${type}/${names[1]}`);
  }
  if(length === 3 && (name.indexOf(`/${type}/`) > -1 || !type || !module)){
    return think.require(name);
  }
  return think.require(`${module}/${type}/${name}`);
};
/**
 * get common module path
 * think.getPath(undefined, think.dirname.controller)
 * think.getPath(home, think.dirname.model)
 * @return {String} []
 */
think.getPath = (module, type = think.dirname.controller, prefix = '') => {
  let mod = '';
  if(think.mode === think.mode_module){
    mod = (module || think.dirname.common) + think.sep;
  }
  return `${think.APP_PATH}${prefix}${think.sep}${mod}${type}`;
};


/**
 * require module
 * @param  {String} name []
 * @return {mixed}      []
 */
let _loadRequire = (name, filepath) => {
  let obj = think.safeRequire(filepath);
  if (think.isFunction(obj)) {
    obj.prototype.__filename = filepath;
  }
  if(obj){
    thinkData.export[name] = obj;
  }
  return obj;
};
think.require = (name, flag) => {
  if (!think.isString(name)) {
    return name;
  }
  // adapter or middle by register
  let Cls = thinkData.export[name];
  if (Cls) {
    return Cls;
  }

  let filepath = thinkData.alias[name];
  if (filepath) {
    return _loadRequire(name, path.normalize(filepath));
  }
  // only check in alias
  if (flag) {
    return null;
  }
  filepath = require.resolve(name);
  return _loadRequire(name, filepath);
};


/**
 * safe require
 * @param  {String} file []
 * @return {mixed}      []
 */
let _interopSafeRequire = file => {
  let obj = require(file);
  if(obj && obj.__esModule && obj.default){
    return obj.default;
  }
  return obj;
};

think.safeRequire = file => {
  // absolute file path is not exist
  if (path.isAbsolute(file)) {
    //no need optimize, only invoked before service start
    if(!think.isFile(file)){
      return null;
    }
    //when file is exist, require direct
    return _interopSafeRequire(file);
  }
  try{
    return _interopSafeRequire(file);
  }catch(err){
    think.log(err);
  }
  return null;
};

/**
 * merge & parse config, support adapter & parser
 * @param  {} configs []
 * @return {}            []
 */
think.parseConfig = function(...configs) {
  let onlyMerge = false;
  if(configs[0] === true){
    onlyMerge = true;
    configs = configs.slice(1);
  }
  configs = configs.map(config => {
    config = think.extend({}, config);
    //check adapter config exist
    if(config.type && config.adapter){
      let adapterConfig = config.adapter[config.type];
      config = think.extend(config, adapterConfig);
      delete config.adapter;
    }
    return config;
  });
  
  let config = think.extend({}, ...configs);

  //check parser method
  if(!think.isFunction(config.parser) || onlyMerge){
    return config;
  }
  
  let ret = config.parser(config, this !== think ? this : {});
  delete config.parser;
  return think.extend(config, ret);
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
think.log = (msg, type, showTime) => {

  //when type or showTime is boolean
  //only show log when value is true
  if(type === false || showTime === false){
    return;
  }else if(type === true){
    type = '';
  }else if(showTime === true){
    showTime = '';
  }


  let dateTime = colors.gray(`[${think.datetime()}] `);
  if(showTime === null){
    dateTime = '';
  }

  let preError = thinkCache(thinkCache.COLLECTION, 'prev_error');
  if (think.isError(msg)) {
    if(think.isPrevent(msg) || msg === preError){
      return;
    }
    thinkCache(thinkCache.COLLECTION, 'prev_error', msg);
    console.error(dateTime + colors.red('[Error] ') + msg.stack);
    return;
  }else if(think.isFunction(msg)){
    msg = msg(colors);
  }else if(think.isObject(msg) || think.isArray(msg)){
    msg = JSON.stringify(msg);
  }
  // if(msg.length > 300){
  //   msg = msg.substr(0, 300) + '...';
  // }
  if(think.isNumber(showTime)){
    let time = Date.now() - showTime;
    msg += ' ' + colors.green(`${time}ms`);
  }
  if(type){
    if(type === 'WARNING'){
      console.warn(dateTime + colors.yellow(`[Warning] `) + msg);
    }
    else if(type === 'EXIT'){
      console.error(colors.red('[Error] ' + msg));
      console.log();
      process.exit();
    }
    else{
      console.log(dateTime + colors.cyan(`[${type}] `) + msg);
    }
  }else{
    console.log(dateTime + msg); 
  }
};


/**
 * load alias
 * @param  {String} type  []
 * @param  {Array} paths []
 * @return {Object}       []
 */
think.alias = (type, paths, slash) => {
  if(!type){
    return thinkData.alias;
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
      let name = file.slice(0, -3).replace(/\\/g, '/');//replace \\ to / on windows
      name = type + (slash ? '/' : '_') + name;
      thinkData.alias[name] = `${path}${think.sep}${file}`;
    });
  });
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
    statusCode: 200,
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
/**
 * get http object
 * @param  {Object} req []
 * @param  {Object} res []
 * @return {Promise}     []
 */
think.http = async (req, res) => {
  let execFlag = res === true;
  //for cli request
  if (res === undefined || res === true) {
    ({req, res} = think._http(req));
  }
  let instance = new Http(req, res);
  let http = await instance.run();
  if(!execFlag){
    return http;
  }
  //flag to cli request, make isCli detect true
  http._cli = true; 
  let App = think.require('app');
  let appInstance = new App(http);
  return appInstance.run();
};
/**
 * base class for has http property
 * @type {Class}
 */
think.http.base = httpBase;

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
  //if session is init, return
  if (http._session) {
    return http._session;
  }

  let sessionOptions = think.config('session');
  let {name, secret} = sessionOptions;
  let cookie = http.cookie(name);
  
  //validate cookie sign
  if (cookie && secret) {
    cookie = Cookie.unsign(cookie, secret);
    //set cookie to http._cookie
    if (cookie) {
      http._cookie[name] = cookie;
    }
  }

  let sessionCookie = cookie;
  let newCookie = false;
  //generate session cookie when cookie is not set
  if (!cookie) {
    let options = sessionOptions.cookie || {};
    cookie = think.uuid(options.length || 32);
    sessionCookie = cookie;
    //sign cookie
    if (secret) {
      cookie = Cookie.sign(cookie, secret);
    }
    http._cookie[name] = sessionCookie;
    http.cookie(name, cookie, options);
    newCookie = true;
  }

  let type = sessionOptions.type || 'memory';
  if (type === 'memory') {
    if (think.config('cluster_on')) {
      type = 'file';
      think.log('in cluster mode, session can\'t use memory for storage, convert to File');
    }
  }
  
  let conf = think.parseConfig(sessionOptions, {
    cookie: sessionCookie,
    newCookie: newCookie
  });
  let cls = think.adapter('session', type);
  let session = new cls(conf);
  http._session = session;

  //save session data after request end
  //http.once('afterEnd', () => session.flush && session.flush());
  return session;
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
    if ('type' in methods) {
      isConfig = true;
    }
  }
  //get model instance
  if (think.isString(superClass) && isConfig) {
    methods = think.extend({}, think.config('db'), methods);
    let base = methods.type === 'mongo' ? 'model_mongo' : '';
    let cls = think.lookClass(superClass, 'model', module, base);
    let names = superClass.split('/');
    return new cls(names[names.length - 1], methods);
  }
  let model = thinkCache(thinkCache.COLLECTION, 'model');
  if(!model){
    model = think.Class('model');
    thinkCache(thinkCache.COLLECTION, 'model', model);
  }
  //create model
  return model(superClass, methods);
};

/**
 * create service sub class
 * @type {Function}
 */
think.service = (superClass, methods, module) => {
  //get service instance
  if (think.isString(superClass)) {
    return think.lookClass(superClass, 'service', module || methods);
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
think.cache = async (name, value, options) => {
  options = think.extend({}, think.config('cache'), options);
  let Cls = think.adapter('cache', options.type || 'memory');
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
    data = await think.co(value(name));
    //data = await think.co.wrap(value)(name);
    await instance.set(name, data);
    return data;
  }
  //set cache
  return instance.set(name, value, options.timeout);
};


/**
 * get locale message
 * can not use arrow function!
 * @param  {String} key  []
 * @param  {String} lang []
 * @return {String}      []
 */
think.locale = function(key, ...data) {
  let lang, locales, defaultLang;
  if(this === think){
    defaultLang = think.config('locale.default');
    lang = think.lang || defaultLang;
    locales = think.config('locale');
  }else{
    defaultLang = this.config('locale.default');
    lang = this.lang();
    locales = this.config(think.dirname.locale);
  }
  let langLocale = locales[lang] || {};
  let defaultLangLocale = locales[defaultLang] || {};
  if(!key){
    return think.isEmpty(langLocale) ? defaultLangLocale : langLocale;
  }
  let enLocale = locales.en || {};
  let value = langLocale[key] || defaultLangLocale[key] || enLocale[key] || key;
  if(!think.isString(value)){
    return value;
  }
  return util.format(value, ...data);
};




/**
 * await 
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
let _awaitInstance = new Await();
think.await = (key, callback) => {
  return _awaitInstance.run(key, callback);
};


/**
 * install node package
 * @param  {String} pkg [package name]
 * @return {Promise}     []
 */
let _dynamicInstall = pkg => {
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
  let cmd = `npm install ${pkgWithVersion} --save`;
  return think.await(cmd, () => {
    let deferred = think.defer();
    think.log(`install package ${pkgWithVersion} start`, 'NPM');
    child_process.exec(cmd, {
      cwd: think.ROOT_PATH
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
};

think.npm = (pkg) => {
  try{
    return Promise.resolve(_interopSafeRequire(pkg));
  } catch(e){
    return _dynamicInstall(pkg);
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
    });
  }
  if(think.isError(err)){
    let message = err.message;
    let errors = thinkData.error;
    let key, value, reg = /^[A-Z\_]$/;
    for(key in errors){
      let pos = message.indexOf(key);
      if(pos > -1){
        let prev = pos === 0 ? '' : message[pos - 1];
        let next = message[pos + key.length];
        if(!reg.test(prev) && !reg.test(next)){
          value = errors[key];
          break;
        }
      }
    }
    if(value){
      let siteMessage = `http://www.thinkjs.org/doc/error_message.html#${key.toLowerCase()}`;
      if(think.isError(addon)){
        addon.message = `${value}, ${addon.message}. ${siteMessage}`;
        return addon;
      }else{
        addon = addon ? `, ${addon}` : '';
        let msg = `${value}${addon}. ${siteMessage}`;
        err.message = msg;
        return err;
      }
    }
    return err;
  }
  return new Error(err);
};
/**
 * exec status action
 * @param  {Number} status []
 * @param  {Object} http   []
 * @return {}        []
 */
think.statusAction = async (status, http, log) => {
  status = status || 500;
  if(think.isPrevent(http.error)){
    return;
  }
  //set error flag, avoid infinite loop
  if(http._error){
    think.log(http.error);
    await http.status(status).end();
    return think.prevent();
  }
  http._error = true;

  //@TODO move log error to error controller
  if(log && think.config('log_error') !== false){
    think.log(http.error);
  }

  let name = `${think.config('default_module')}/${think.dirname.controller}/error`;
  if(think.mode === think.mode_module){
    name = `${think.dirname.common}/${think.dirname.controller}/error`;
  }

  let cls = think.require(name, true);
  
  //error controller not found
  if(!cls){
    http.error = new Error(think.locale('CONTROLLER_NOT_FOUND', name, http.url));
    return think.statusAction(status, http, log);
  }
  
  //set http status
  //http.status(status);

  let instance = new cls(http);
  await instance.invoke(`_${status}Action`, instance);
  
  return think.prevent();
};

/**
 * waterfall
 * @param  {Array}   dataList []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
think.waterfall = async (dataList, callback) => {
  let itemFn = think.isFunction(dataList[0]);
  let data;
  for(let i = 0, length = dataList.length; i < length; i++){
    let ret = itemFn ? dataList[i](callback, data) : callback(dataList[i], data);
    data = await think.co(ret);
    if(data === null){
      return data;
    }
  }
  return data;
};

/**
 * parallel limit exec
 * @param  {String}   key      []
 * @param  {Mixed}   data     []
 * @param  {Function} callback []
 * @return {}            []
 */
think.parallelLimit = (key, data, callback, options = {}) => {

  if(!think.isString(key) || think.isFunction(data)){
    options = callback || {};
    callback = data;
    data = key;
    key = '';
  }
  if(!think.isFunction(callback)){
    options = callback || {};
    callback = undefined;
  }
  if(think.isNumber(options)){
    options = {limit: options};
  }
  
  let flag = !think.isArray(data) || options.array;
  if(!flag){
    key = '';
  }

  //get parallel limit class
  let Limit = thinkCache(thinkCache.COLLECTION, 'limit');
  if (!Limit) {
    Limit = think.require('parallel_limit');
    thinkCache(thinkCache.COLLECTION, 'limit', Limit);
  }

  let instance;
  if(key){
    instance = thinkCache(thinkCache.LIMIT, key);
    if(!instance){
      instance = new Limit(options.limit, callback);
      thinkCache(thinkCache.LIMIT, key, instance);
    }
  }else{
    instance = new Limit(options.limit, callback);
  }

  if(flag){
    return instance.add(data);
  }
  return instance.addMany(data, options.ignoreError);
};