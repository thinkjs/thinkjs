'use strict';

let fs = require('fs');
let path = require('path');

require('./core/think.js');

module.exports = class {
  /**
   * init
   * @param  {Object} options [project options]
   * @return {}         []
   */
  constructor(options = {}){
    //extend options to think
    think.extend(think, this.getPath(), options);
    //parse data from process arguments
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
    argv = process.argv[i];
    //get port or cli url from argv
    if (argv) {
      if (/^\d+$/.test(argv)) {
        think.port = argv;
      }else{
        think.cli = argv;
      }
    }
    //get app mode
    think.mode = this.getMode();
  }
  /**
   * get app mode
   * @return {Number} [app mode]
   */
  getMode(){
    let filepath = `${think.APP_PATH}/${think.dirname.controller}/`;
    if (think.isDir(filepath)) {
      let files = fs.readdirSync(filepath);
      let flag = files.some(file => {
        if (think.isFile(filepath + file)) {
          return true;
        }
      })
      return flag ? think.mode_mini : think.mode_normal;
    }
    return think.mode_module;
  }
  /**
   * get app path
   * @return {Object} []
   */
  getPath(){
    let filepath = process.argv[1];
    let ROOT_PATH = path.dirname(filepath);
    let APP_PATH = `${path.dirname(ROOT_PATH)}/app`;
    return {
      APP_PATH,
      RESOURCE_PATH: ROOT_PATH,
      ROOT_PATH
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
    //only have default module in mini mode
    if (think.mode === think.mode_mini) {
      return [think.config('default_module')];
    }
    let modulePath = think.APP_PATH;
    if (think.mode === think.mode_normal) {
      modulePath += `/${think.dirname.controller}`;
    }
    let modules = fs.readdirSync(modulePath);
    let denyModuleList = think.config('deny_module_list') || [];
    if (denyModuleList.length > 0) {
      modules = modules.filter(module => {
        if (denyModuleList.indexOf(module) === -1) {
          return module;
        }
      })
    }
    think.module = modules;
    return modules;
  }
  /**
   * load alias
   * @return {} []
   */
  loadAlias(){
    let aliasPath = `${think.THINK_LIB_PATH}/config/alias.js`;
    think._alias = require(aliasPath);
  }
  /**
   * load alias module export
   * @return {} []
   */
  loadAliasExport(){
    for(let key in think._alias){
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
    modules.forEach(module => {
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
    let paths = [
      `${think.THINK_LIB_PATH}/middleware`,
      `${think.getPath(undefined, think.dirname.middleware)}`
    ]
    think.alias('middleware', paths);
    //middleware base class
    think.middleware.base = think.require('middleware_base');
  }
  /**
   * load hook
   * @return {} []
   */
  loadHook(){
    let hookPath = `${think.THINK_LIB_PATH}/config/hook.js`;
    let hook = require(hookPath);
    let file = `${think.getPath(undefined, think.dirname.config)}/hook.js`;
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
    let types = {
      model: [],
      controller: ['base', 'rest'],
      logic: ['base'],
      service: ['base']
    }
    for(let type in types){
      think.alias(type, `${think.THINK_LIB_PATH}/${type}`);
      types[type].forEach(item => {
        think[type][item] = think.require(`${type}_${item}`);
      })
      think.module.forEach(module => {
        let moduleType = `${module}/${type}`;
        let filepath = `${think.getPath(module, think.dirname[type])}/`;
        think.alias(moduleType, filepath, true);
      })
    }
  }
  /**
   * load call controller
   * @return {} []
   */
  loadCallController(){
    let callController = think.config('call_controller');
    if (!callController) {
      return;
    }
    let call = callController.split('/');
    let name = `${call[0]}/${think.dirname.controller}/${call[1]}`;
    let action = call[2];
    if (think.mode === think.mode_mini) {
      let length = call.length;
      name = `${think.config('default_module')}/${think.dirname.controller}/${call[length - 2]}`;
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
      `${think.THINK_LIB_PATH}/bootstrap`,
      `${think.APP_PATH}/${think.dirname.common}/${think.dirname.bootstrap}`
    ];
    paths.forEach(item => {
      if (!think.isDir(item)) {
        return;
      }
      let files = fs.readdirSync(item);
      files.forEach(file => {
        think.safeRequire(`${item}/${file}`);
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

    let add = filepath => {
      if (!think.isDir(filepath)) {
        return;
      }
      let files = fs.readdirSync(filepath);
      files.forEach(file => {
        let key = filepath + file;
        data[key] = true;
      })
    }
    think.module.forEach(module => {
      filepath = think.getPath(module, think.dirname.view);
      add(filepath);
    })
    thinkCache(thinkCache.TEMPLATE, data);
  }
  /**
   * load error message
   * @return {} []
   */
  loadMessage(){
    let config = require(`${think.THINK_LIB_PATH}/config/message.js`);
    let filepath = `${think.getPath()}/${think.dirname.config}/message.js`;
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
    //this.loadAliasExport();
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
      let fn = (item, file) => {
        if (think.isString(item)) {
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
        if(retainFiles.some(item => fn(item, file))){
          continue;
        }
        let mod = require.cache[file];
        //remove from parent module
        if(mod && mod.parent){
          mod.parent.children.splice(mod.parent.children.indexOf(mod), 1);
        }
        //remove children
        if(mod && mod.children){
          mod.children.length = 0;
        }
        //remove require cache
        require.cache[file] = null;
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
  async run(){
    try{
      this.start();
      await this.install();
      await think.require('app').run();
    }catch(err){
      console.log(err.stack);
    }
  }
}