'use strict';

import fs from 'fs';
import path from 'path';
import {} from './core/think.js';

export default class {
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
    if (argv === 'production' || argv === 'development') {
      think.env = argv;
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
    let filepath = `${think.APP_PATH}/${think.dirname.controller}`;
    if (think.isDir(filepath)) {
      let files = fs.readdirSync(filepath);
      let flag = files.some(file => {
        if (think.isFile(`${filepath}/${file}`)) {
          return true;
        }
      });
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
    };
  }
  /**
   * check node env
   * @return {Boolean} []
   */
  checkEnv(){
    let packageFile = `${think.THINK_PATH}/package.json`;
    let {engines} = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
    let needVersion = engines.node.substr(2);
    let nodeVersion = process.version.substr(1);
    if(needVersion > nodeVersion){
      throw new Error(`ThinkJS need node version >= ${needVersion}, current version is ${nodeVersion}, please upgrade it.`);
    }
  }
  /**
   * check application filename is lower
   * @return {} []
   */
  checkFileName(){
    let files = think.getFiles(think.APP_PATH);
    let reg = /\.(js|html|tpl)$/;
    let fileReg = /^[\\\/_\.a-z0-9]+$/;
    let filter = item => {
      if(!reg.test(item)){
        return;
      }
      //ignore files in config/locale
      if(item.indexOf(think.dirname.locale) > -1){
        return;
      }
      return true;
    };
    files.forEach(item => {
      if(filter(item) && !fileReg.test(item)){
        think.log(colors => {
          return colors.yellow(`[WARNING]`) + ` filepath \`${item}\` has uppercase chars.`;
        });
      }
    });
  }
  /**
   * get app module list
   * @return {} []
   */
  getModule(){
    //only have default module in mini mode
    if (think.mode === think.mode_mini) {
      think.module = [think.config('default_module')];
      return think.module;
    }
    let modulePath = think.APP_PATH;
    if (think.mode === think.mode_normal) {
      modulePath += `/${think.dirname.controller}`;
    }
    if(!think.isDir(modulePath)){
      return [];
    }
    let modules = fs.readdirSync(modulePath);
    let denyModuleList = think.config('deny_module_list') || [];
    if (denyModuleList.length > 0) {
      modules = modules.filter(module => {
        if (denyModuleList.indexOf(module) === -1) {
          return module;
        }
      });
    }
    think.module = modules;
    return modules;
  }
  /**
   * load alias
   * @return {} []
   */
  loadAlias(){
    let aliasPath = `${think.THINK_LIB_PATH}/config/sys/alias.js`;
    thinkCache(thinkCache.ALIAS, require(aliasPath));
  }
  /**
   * load alias module export
   * @return {} []
   */
  loadAliasExport(){
    var alias = thinkCache(thinkCache.ALIAS);
    for(let key in alias){
      if (thinkCache(thinkCache.ALIAS_EXPORT, key)) {
        continue;
      }
      thinkCache(thinkCache.ALIAS_EXPORT, key, think.require(key));
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
    let configs = think.extend(config, commonConfig);
    thinkCache(thinkCache.CONFIG, configs);
    let modules = this.getModule();
    //load modules config
    modules.forEach(module => {
      think.getModuleConfig(module);
    });
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
    think.loadAdapter();
  }
  /**
   * load middleware
   * @return {} []
   */
  loadMiddleware(){
    let paths = [
      `${think.THINK_LIB_PATH}/middleware`,
      `${think.getPath(undefined, think.dirname.middleware)}`
    ];
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
    thinkCache(thinkCache.HOOK, hook);
  }
  /**
   * load controller, model, logic, service files
   * @return {} []
   */
  loadMVC(){
    let types = {
      model: ['base', 'relation'],
      controller: ['base', 'rest'],
      logic: ['base'],
      service: ['base']
    };
    for(let type in types){
      think.alias(type, `${think.THINK_LIB_PATH}/${type}`);
      types[type].forEach(item => {
        think[type][item] = think.require(`${type}_${item}`);
      });
      think.module.forEach(module => {
        let moduleType = `${module}/${type}`;
        let filepath = think.getPath(module, think.dirname[type]);
        think.alias(moduleType, filepath, true);
      });
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
      });
    });
  }
  /**
   * load template file
   * add template files to cache
   * @return {} []
   */
  loadTemplate(){
    let data = {};

    let add = filepath => {
      if (!think.isDir(filepath)) {
        return;
      }
      let files = think.getFiles(filepath);
      files.forEach(file => {
        let key = path.normalize(`${filepath}/${file}`);
        data[key] = true;
      });
    };
    let {root_path} = think.config('tpl');
    if(root_path){
      add(root_path);
    }else{
      think.module.forEach(module => {
        add(think.getPath(module, think.dirname.view));
      });
    }
    thinkCache(thinkCache.TEMPLATE, data);
  }
  /**
   * load system error message
   * @return {} []
   */
  loadError(){
    let message = require(think.THINK_LIB_PATH + '/config/sys/error.js');
    thinkCache(thinkCache.ERROR, message);
  }
  /**
   * load all config or modules
   * @return {} []
   */
  load(){
    thinkCache(thinkCache.ALIAS, null);
    thinkCache(thinkCache.ALIAS_EXPORT, null);
    thinkCache(thinkCache.MODULE_CONFIG, null);

    this.loadConfig();
    this.loadRoute();
    this.loadAlias();
    this.loadAdapter();
    this.loadMiddleware();
    this.loadMVC();
    this.loadHook();
    this.loadTemplate();
    this.loadError();

    this.loadBootstrap();

    //load alias export at last
    //this.loadAliasExport();
  }
  /**
   * auto reload user modified files
   * @return {} []
   */
  autoReload(){
    let autoReload = thinkCache(thinkCache.AUTO_RELOAD);
    //clear file cache
    let clearFileCache = file => {
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
    };
    let fn = () => {
      let hasChange = false;
      for(let file in require.cache){
        let mTime = fs.statSync(file).mtime.getTime();
        if(!autoReload[file]){
          autoReload[file] = mTime;
          continue;
        }
        if(mTime > autoReload[file]){
          clearFileCache(file);
          autoReload[file] = mTime;
          hasChange = true;
        }
      }
      if(hasChange){
        this.load();
      }
    };
    setInterval(fn.bind(this), 1000);
  }
  /**
   * capture error
   * @return {} []
   */
  captureError(){
    process.on('uncaughtException', function(err){
      err = think.error(err, 'port:' + think.config('port'));
      think.log(err);
    });
  }
  /**
   * start
   * @return {} []
   */
  start(){
    this.checkEnv();
    this.checkFileName();
    this.load();
    this.captureError();
    if (think.config('auto_reload')) {
      this.autoReload();
    }
  }
  /**
   * run
   * @return {} []
   */
  run(){
    this.start();
    return think.require('app').run();
  }
}