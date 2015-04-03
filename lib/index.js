'use strict';

var fs = require('fs');
var cluster = require('cluster');
var path = require('path');

require('./core/think.js');

module.exports = think.Class({
  /**
   * init
   * @param  {Object} options [project options]
   * @return {}         []
   */
  init: function(options){
    options = options || {};
    //extend options to think
    think.extend(think, this.getPath(), options);
    var argv = process.argv[2];
    var i = 2;
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
  },
  /**
   * get app path
   * @return {Object} []
   */
  getPath: function(){
    var filepath = process.argv[1];
    var rootPath = path.dirname(filepath);
    var appPath = path.dirname(rootPath) + '/app';
    return {
      APP_PATH: appPath,
      RESOURCE_PATH: rootPath,
      ROOT_PATH: rootPath
    }
  },
  /**
   * check node env
   * @TODO
   * @return {Boolean} []
   */
  checkEnv: function(){
    
  },
  /**
   * get app module list
   * @return {} []
   */
  getModule: function(){
    if (think.mini) {
      return [];
    }
    var modules = fs.readdirSync(think.APP_PATH);
    var denyModuleList = think.config('deny_module_list') || [];
    if (denyModuleList.length === 0) {
      think.module = modules;
      return modules;
    }
    modules = modules.filter(function(module){
      if (denyModuleList.indexOf(module) === -1) {
        return module;
      }
    })
    think.module = modules;
    return modules;
  },
  /**
   * load alias
   * @return {} []
   */
  loadAlias: function(){
    think._alias = require(think.THINK_LIB_PATH + '/config/alias.js');
  },
  /**
   * load alias module export
   * @return {} []
   */
  loadAliasExport: function(){
    for(var key in think._alias){
      if (key in think._aliasExport) {
        continue;
      }
      think._aliasExport[key] = think.require(key);
    }
  },
  /**
   * load config
   * @return {} []
   */
  loadConfig: function(){
    //sys config
    var config = think.getModuleConfig(true);
    //common module config
    var commonConfig = think.getModuleConfig();
    think._config = think.extend(config, commonConfig);
    var modules = this.getModule();
    //load modules config
    modules.forEach(function(module){
      think.getModuleConfig(module);
    })
  },
  /**
   * load route
   * @return {} []
   */
  loadRoute: function(){
    think.route();
  },
  /**
   * load adapter
   * @return {} []
   */
  loadAdapter: function(){
    think.loadAdapter(true);
  },
  /**
   * load middleware
   * @return {} []
   */
  loadMiddleware: function(){
    var type = 'middleware';
    var paths = [
      think.THINK_LIB_PATH + '/' + type,
      think.getModulePath() + '/' + think.dirname.middleware
    ]
    think.alias(type, paths);
  },
  /**
   * load hook
   * @return {} []
   */
  loadHook: function(){
    var hook = require(think.THINK_LIB_PATH + '/config/hook.js');
    var file = think.getModulePath() + '/' + think.dirname.config + '/hook.js';
    var data = think.safeRequire(file) || {};
    var key, value;
    for(key in data){
      value = data[key];
      if (!(key in hook)) {
        hook[key] = data[key];
      }else if (think.isBoolean(data[0])) {
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
    think._hook = hook;
  },
  /**
   * load controller, model, logic, service files
   * @return {} []
   */
  loadMVC: function(){
    var list = [/*'model',*/ 'controller', 'logic', 'service'];
    list.forEach(function(type){
      think.alias(type, think.THINK_LIB_PATH + '/' + type);
      if (think.mini) {
        var path = think.getModulePath() + '/' + think.dirname[type];
        think.alias(think.config('default_module') + '/' + type, path, true);
      }else{
        think.module.forEach(function(module){
          think.alias(module + '/' + type, think.getModulePath(module) + '/' + think.dirname[type], true);
        })
      }
    })
  },
  /**
   * load call controller
   * @return {} []
   */
  loadCallController: function(){
    //load call controller
    var callController = think.config('call_controller');
    if (!callController) {
      return;
    }
    var call = callController.split('/');
    var name = call[0] + '/' + think.dirname.controller + '/' + call[1];
    var action = call[2];
    if (think.mini) {
      var length = call.length;
      name = think.config('default_module') + '/' + think.dirname.controller + '/' + call[length - 2];
      action = call[length - 1];
    }
    if (!(name in think._alias)) {
      return;
    }
    var cls = think.require(name);
    var method = cls.prototype[action + think.config('action_suffix')];
    var callMethod = cls.prototype.__call;
    if (think.isFunction(method)) {
      think._alias.call_controller = think._alias[name];
      think.config('call_action', action);
    }else if (think.isFunction(callMethod)) {
      think._alias.call_controller = think._alias[name];
      think.config('call_action', '__call');
    }
  },
  /**
   * load bootstrap
   * @return {} []
   */
  loadBootstrap: function(){
    var paths = [
      think.THINK_LIB_PATH + '/bootstrap',
      think.APP_PATH + '/' + think.dirname.common + '/' + think.dirname.bootstrap
    ];
    paths.forEach(function(item){
      if (!think.isDir(item)) {
        return;
      }
      var files = fs.readdirSync(item);
      files.forEach(function(file){
        think.safeRequire(item + '/' + file);
      })
    })
  },
  /**
   * load template file
   * add template files to cache
   * @return {} []
   */
  loadTemplate: function(){
    var data = {}, filepath;

    function add(filepath){
      if (!think.isDir(filepath)) {
        return;
      }
      var files = fs.readdirSync(filepath);
      files.forEach(function(file){
        var key = filepath + file;
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
  },
  /**
   * load error message
   * @return {} []
   */
  loadMessage: function(){
    var config = require(think.THINK_LIB_PATH + '/config/message.js');
    var filepath = think.getModulePath() + '/' + think.dirname.config + '/message.js';
    var appConfig = think.safeRequire(filepath);
    think._message = think.extend({}, config, appConfig);
  },
  /**
   * load all config or modules
   * @return {} []
   */
  load: function(){
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
  },
  /**
   * auto reload user modified files
   * @return {} []
   */
  autoReload: function(){
    var self = this;
    var timer = setInterval(function(){
      var time = Date.now();
      //auto clear interval when running more than 2 days
      if (time - think.startTime >  2 * 24 * 3600 * 1000) {
        think.log('file auto reload is stoped');
        clearInterval(timer);
        return;
      }
      var retainFiles = think.config('auto_reload_except');
      var fn = function(item){
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
      for(var file in require.cache){
        var flag = retainFiles.some(fn);
        if (!flag) {
          //remove require cache
          require.cache[file] = null;
        }
      }
      self.load();
    }, 1000);
    think.timer.autoReload = timer;
  },
  /**
   * start
   * @return {} []
   */
  start: function(){
    this.checkEnv();
    this.load();
    if (think.config('auto_reload')) {
      this.autoReload();
    }
  },
  /**
   * install npm dependencies
   * @TODO
   * @return {Promise} []
   */
  install: function(){
    return Promise.resolve();
  },
  /**
   * run
   * @return {} []
   */
  run: function(){
    this.start();
    this.install().then(function(){
      think.require('app').run();
    })
  }
}, true)