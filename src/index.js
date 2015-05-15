'use strict';

var fs = require('fs');
var path = require('path');

require('./core/think.js');

module.exports = class{
  /**
   * init
   * @param  {Object} options [project options]
   * @return {}         []
   */
  constructor(options = {}){
    //extend options to think
    think.extend(think, this.getPath(), options);
    let i = 2;
    let argv = process.argv[i];
    //get app mode from argv
    if (argv === 'online') {
      think.debug = false;
      i++;
    }else if (argv === 'debug') {
      think.debug = true;
      i++;
    }
    argv = process[i];
    //get port or cli url from argv
    if (argv) {
      if (/^\d+$/.test(argv)) {
        think.port = argv;
      }else{
        think.mode = 'cli';
        think.url = argv;
      }
    }
    //check app is mini mode
    if (think.isDir(think.APP_PATH + '/' + think.dirname.controller)) {
      think.mini = true;
    }
  }
  /**
   * get app path
   * @return {Object} []
   */
  getPath(){
    let filepath = process.argv[1];
    let rootPath = path.dirname(filepath);
    let appPath = path.dirname(rootPath) + '/app';
    return {
      APP_PATH: appPath,
      RESOURCE_PATH: rootPath,
      ROOT_PATH: rootPath
    }
  }
  /**
   * check node env
   * @TODO
   * @return {Boolean} []
   */
  checkEnv(){
    
  }
  /**
   * get app module list
   * @return {} []
   */
  getModule(){
    if (think.mini) {
      return [];
    }
    let modules = fs.readdirSync(think.APP_PATH);
    let denyModuleList = think.config('deny_module_list') || [];
    if (denyModuleList.length === 0) {
      think.module = modules;
      return modules;
    }
    modules = modules.filter((module) => {
      if (denyModuleList.indexOf(module) === -1) {
        return module;
      }
    })
    think.module = modules;
    return modules;
  }
  /**
   * load alias
   * @return {} []
   */
  loadAlias(){
    think._alias = require(think.THINK_LIB_PATH + '/config/alias.js');
  }
  /**
   * load alias module export
   * @return {} []
   */
  loadAliasExport(){
    for(var key in think._alias){
      if (key in think._aliasExport) {
        continue;
      }
      think._aliasExport[key] = think.require(key);
    }
  }
  /**
   * load config
   * @return {} []
   */
  loadConfig(){
    //sys config
    let config = think.getModuleConfig(true);
    //common module config
    let commonConfig = think.getModuleConfig();
    think._config = think.extend(config, commonConfig);
    let modules = this.getModule();
    //load modules config
    modules.forEach(function(module){
      think.getModuleConfig(module);
    })
  }
  /**
   * load route
   * @return {} []
   */
  loadRoute(){
    think.route();
  }
  /**
   * load adapter
   * @return {} []
   */
  loadAdapter(){
    think.loadAdapter(true);
  }
  /**
   * load middleware
   * @return {} []
   */
  loadMiddleware(){
    let type = 'middleware';
    let paths = [
      think.THINK_LIB_PATH + '/' + type,
      think.getModulePath() + '/' + think.dirname.middleware
    ]
    think.alias(type, paths);
  }
  /**
   * load hook
   * @return {} []
   */
  loadHook(){
    let hook = require(think.THINK_LIB_PATH + '/config/hook.js');
    let file = think.getModulePath() + '/' + think.dirname.config + '/hook.js';
    let data = think.safeRequire(file) || {};
    let key, value;
    for(key in data){
      value = data[key];
      if (!(key in hook)) {
        hook[key] = data[key];
      }else if (think.isBoolean(data[0])) {
        let flag = value.shift();
        if (flag) {
          hook[key] = value;
        }else{
          hook[key] = value.concat(hook[key]);
        }
      }else{
        hook[key] = hook[key].concat(value);
      }
    }
    think._hook = hook;
  }
  /**
   * load controller, model, logic, service files
   * @return {} []
   */
  loadMVC(){
    let list = [/*'model',*/ 'controller', 'logic', 'service'];
    list.forEach(function(type){
      think.alias(type, think.THINK_LIB_PATH + '/' + type);
      if (think.mini) {
        let path = think.getModulePath() + '/' + think.dirname[type];
        think.alias(think.getModule() + '/' + type, path, true);
      }else{
        think.module.forEach(function(module){
          think.alias(module + '/' + type, think.getModulePath(module) + '/' + think.dirname[type], true);
        })
      }
    })
  }
  /**
   * load call controller
   * @return {} []
   */
  loadCallController(){
    //load call controller
    let callController = think.config('call_controller');
    if (!callController) {
      return;
    }
    let call = callController.split('/');
    let name = call[0] + '/' + think.dirname.controller + '/' + call[1];
    let action = call[2];
    if (think.mini) {
      let length = call.length;
      name = think.config('default_module') + '/' + think.dirname.controller + '/' + call[length - 2];
      action = call[length - 1];
    }
    if (!(name in think._alias)) {
      return;
    }
    let cls = think.require(name);
    let method = cls.prototype[action + think.config('action_suffix')];
    let callMethod = cls.prototype.__call;
    if (think.isFunction(method)) {
      think._alias.call_controller = think._alias[name];
      think.config('call_action', action);
    }else if (think.isFunction(callMethod)) {
      think._alias.call_controller = think._alias[name];
      think.config('call_action', '__call');
    }
  }
  /**
   * load bootstrap
   * @return {} []
   */
  loadBootstrap(){
    let paths = [
      think.THINK_LIB_PATH + '/bootstrap',
      think.APP_PATH + '/' + think.dirname.common + '/' + think.dirname.bootstrap
    ];
    paths.forEach(function(item){
      if (!think.isDir(item)) {
        return;
      }
      let files = fs.readdirSync(item);
      files.forEach(function(file){
        think.safeRequire(item + '/' + file);
      })
    })
  }
  /**
   * load template file
   * add template files to cache
   * @return {} []
   */
  loadTemplate(){
    let data = {}, filepath;

    function add(filepath){
      if (!think.isDir(filepath)) {
        return;
      }
      let files = fs.readdirSync(filepath);
      files.forEach(function(file){
        let key = filepath + file;
        data[key] = true;
      })
    }
    if (think.mini) {
      filepath = think.APP_PATH + '/' + think.dirname.view + '/';
      add(filepath);
    }else{
      think.module.forEach(function(module){
        filepath = think.APP_PATH + '/' + module + '/' + think.dirname.view + '/';
        add(filepath);
      })
    }
    thinkCache(thinkCache.TEMPLATE, data);
  }
  /**
   * load error message
   * @return {} []
   */
  loadMessage(){
    let config = require(think.THINK_LIB_PATH + '/config/message.js');
    let filepath = think.getModulePath() + '/' + think.dirname.config + '/message.js';
    let appConfig = think.safeRequire(filepath);
    think._message = think.extend({}, config, appConfig);
  }
  /**
   * load all config or modules
   * @return {} []
   */
  load(){
    think._alias = {};
    think._aliasExport = {};
    
    this.loadConfig();
    
    this.loadBootstrap();
    this.loadRoute();
    this.loadAlias();
    this.loadAdapter();
    this.loadMiddleware();
    this.loadMVC();
    this.loadCallController();
    this.loadHook();
    this.loadTemplate();
    this.loadMessage();

    //load alias export at last
    this.loadAliasExport();
  }
  /**
   * auto reload user modified files
   * @return {} []
   */
  autoReload(){
    let timer = setInterval(() => {
      let time = Date.now();
      //auto clear interval when running more than 2 days
      if (time - think.startTime >  2 * 24 * 3600 * 1000) {
        think.log('file auto reload is stoped');
        clearInterval(timer);
        return;
      }
      let retainFiles = think.config('auto_reload_except');
      let fn = function(item){
        if (think.isString(item)) {
          if (process.platform === 'win32') {
            item = item.replace(/\//g, '\\');
          }
          if (file.indexOf(item) > -1) {
            return true;
          }
        }else if (think.isRegExp(item)) {
          return item.test(file);
        }else if (think.isFunction(item)) {
          return item(file);
        }
      };
      for(let file in require.cache){
        let flag = retainFiles.some(fn);
        if (!flag) {
          //remove require cache
          require.cache[file] = null;
        }
      }
      this.load();
    }, 1000);
    think.timer.autoReload = timer;
  }
  /**
   * start
   * @return {} []
   */
  start(){
    this.checkEnv();
    this.load();
    if (think.config('auto_reload')) {
      this.autoReload();
    }
  }
  /**
   * install npm dependencies
   * @TODO
   * @return {Promise} []
   */
  install(){
    return Promise.resolve();
  }
  /**
   * run
   * @return {} []
   */
  run(){
    this.start();
    this.install().then(function(){
      think.require('app').run();
    })
  }
}