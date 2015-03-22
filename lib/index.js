'use strict';

var fs = require('fs');
var cluster = require('cluster');

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
    think.extend(think, options);
    if (!think.APP_PATH) {
      throw new Error('options.APP_PATH must be set');
    }
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
      return modules;
    }
    modules =  modules.filter(function(module){
      if (denyModuleList.indexOf(module) === -1) {
        return module;
      }
    })
    think.module = modules;
    return modules;
  },
  /**
   * check node or iojs env
   * @return {Boolean} []
   */
  checkEnv: function(){

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
      think._aliasExport[key] = require(think._alias[key]);
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
    think.hook = hook;
  },
  /**
   * load controller files
   * @return {} []
   */
  loadMVC: function(){
    var list = [/*'model',*/ 'controller', 'logic', 'service'];
    var self = this;
    list.forEach(function(type){
      think.alias(type, think.THINK_LIB_PATH + '/' + type);
      if (think.mini) {
        think.alias('common/' + type, think.getModulePath() + '/' + think.dirname[type], true);
      }else{
        var modules = self.getModule();
        modules.forEach(function(module){
          think.alias(module + '/' + type, think.getModulePath(module) + '/' + think.dirname[type], true);
        })
      }
    })
  },
  /**
   * load all config or modules
   * @return {} []
   */
  load: function(){
    think._alias = {};
    think._aliasExport = {};
    
    this.loadConfig();
    
    this.loadAlias();
    this.loadAdapter();
    this.loadMiddleware();
    this.loadMVC();
    this.loadHook();

    //load alias export at last
    this.loadAliasExport();
  },
  /**
   * catch uncaught exception
   * @return {} []
   */
  uncaughtException: function(){
    process.on('uncaughtException', function(err) {
      think.log(err);
    });
  },
  /**
   * load process id
   * @return {} []
   */
  logPid: function(){
    if (!cluster.isMaster) {
      return;
    }
    var dir = think.getModulePath() + '/runtime/data';
    think.mkdir(dir);
    var pidFile = dir + '/app.pid';
    fs.writeFileSync(pidFile, process.pid);
    //change pid file mode
    think.chmod(pidFile);
    //remove pid file until process exit
    process.on('SIGTERM', function () {
      if (fs.existsSync(pidFile)) {
        fs.unlinkSync(pidFile);
      }
      process.exit(0);
    });
  },
  /**
   * auto reload user modified files
   * @return {} []
   */
  autoReload: function(){
    var self = this;
    var timer = setInterval(function(){
      var time = Date.now();
      //auto clear interval when more than exceed days in debug mode
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
          require.cache[file] = null;
        }
      }
      self.load();
    }, 1000);
    think.gcTimer.autoReload = timer;
  },
  /**
   * start
   * @return {} []
   */
  start: function(){
    this.checkEnv();
    this.uncaughtException();
    this.load();
    if (think.config('auto_reload')) {
      this.autoReload();
    }
    if (think.config('log_pid')) {
      this.logPid();
    }
  },
  run: function(){
    this.start();
    console.log(think._alias)
  }
}, true)