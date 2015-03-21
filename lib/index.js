'use strict';

require('./core/think.js');

module.exports = think.Class({
  /**
   * init
   * @param  {Object} options [project options]
   * @return {}         []
   */
  init: function(options){
    options = options || {};
    console.log('options', options)
    return;
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
    argv = project[i];
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
    var denyModuleList = think._config.deny_module_list || [];
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
    var alias = require(think.THINK_LIB_PATH + '/config/alias.js');
    for(var key in alias){
      think._alias[key] = think.safeRequire(alias[key]);
    }
  },
  /**
   * load alias module export
   * @return {} []
   */
  loadAliasExport: function(){
    for(var key in think._alias){
      if (!(key in think._aliasExport)) {
        think._aliasExport[key] = require(think._alias[key]);
      }
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
    think._config = extend(config, commonConfig);
    var modules = think.getModule();
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
  },
  /**
   * load controller files
   * @return {} []
   */
  loadController: function(){

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
    this.loadController();
    //load alias export at last
    this.loadAliasExport();
  },
  /**
   * run
   * @return {} []
   */
  run: function(){
    this.checkEnv();
    this.load();
  }
}, true)