'use strict';

import fs from 'fs';
import path from 'path';

//rewrite promise, bluebird is much faster
require('babel-runtime/core-js/promise').default = require('bluebird');
global.Promise = require('bluebird');

import AutoReload from './util/auto_reload.js';
import WatchCompile from './util/watch_compile.js';
import Checker from './util/checker.js';

import './core/think.js';

export default class {
  /**
   * init
   * @param  {Object} options [project options]
   * @return {}         []
   */
  constructor(options = {}){
    //extend options to think
    think.extend(think, this.getPath(), options);

    //normalize path
    think.APP_PATH = path.normalize(think.APP_PATH);
    think.ROOT_PATH = path.normalize(think.ROOT_PATH);
    think.RESOURCE_PATH = path.normalize(think.RESOURCE_PATH);
    think.RUNTIME_PATH = path.normalize(think.RUNTIME_PATH);

    //parse data from process arguments
    let i = 2;
    let argv = process.argv[i];
    //get app mode from argv
    if (argv === 'production' || argv === 'development' || argv === 'testing') {
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
      return think.mode_normal;
    }
    return think.mode_module;
  }
  /**
   * get app path
   * @return {Object} []
   */
  getPath(){
    let filepath = process.argv[1];
    let RESOURCE_PATH = path.dirname(filepath);
    let ROOT_PATH = path.dirname(RESOURCE_PATH);
    let APP_PATH = `${ROOT_PATH}${think.sep}app`;
    let RUNTIME_PATH = ROOT_PATH + think.sep + think.dirname.runtime;
    return {
      APP_PATH,
      RESOURCE_PATH,
      ROOT_PATH,
      RUNTIME_PATH
    };
  }
  /**
   * check node env
   * @return {Boolean} []
   */
  checkEnv(){
    this.checkNodeVersion();
  }
  
  /**
   * get app module list
   * @return {} []
   */
  getModule(){
    //only have default module in mini mode
    if (think.mode === think.mode_normal) {
      think.module = [think.config('default_module')];
      return think.module;
    }
    let modulePath = think.APP_PATH;
    if(!think.isDir(modulePath)){
      return [];
    }
    let modules = fs.readdirSync(modulePath);
    let denyModuleList = think.config('deny_module_list') || [];
    if (denyModuleList.length > 0) {
      modules = modules.filter(module => {
        if(module[0] === '.'){
          return;
        }
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
    thinkData.alias = think.safeRequire(aliasPath);
  }
  /**
   * load config
   * @return {} []
   */
  loadConfig(){
    think.getModuleConfig();
    //load modules config
    this.getModule().forEach(module => {
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
    think.adapter.load();
  }
  /**
   * load middleware
   * @return {} []
   */
  loadMiddleware(){
    let paths = [
      `${think.THINK_LIB_PATH}${think.sep}middleware`,
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
    thinkData.hook = think.extend({}, think.safeRequire(hookPath));

    let file = `${think.getPath(undefined, think.dirname.config)}/hook.js`;
    let data = think.extend({}, think.safeRequire(file));
    for(let key in data){
      think.hook.set(key, data[key]); 
    }
  }
  /**
   * load controller, model, logic, service files
   * @return {} []
   */
  loadMVC(){
    let types = {
      model: ['base', 'relation', 'mongo', 'adv'],
      controller: ['base', 'rest'],
      logic: ['base'],
      service: ['base']
    };
    for(let itemType in types){
      think.alias(itemType, `${think.THINK_LIB_PATH}${think.sep}${itemType}`);
      types[itemType].forEach(item => {
        think[itemType][item] = think.require(`${itemType}_${item}`);
      });
      think.module.forEach(module => {
        let moduleType = `${module}/${itemType}`; //can not use think.sep
        let filepath = think.getPath(module, think.dirname[itemType]);
        think.alias(moduleType, filepath, true);
      });
    }
  }
  /**
   * load sub controller
   * @return {} []
   */
  loadSubController(){
    think.module.forEach(module => {
      let filepath = think.getPath(module, think.dirname.controller);
      let subControllers = think.getFiles(filepath).filter(item => {
        if(item.indexOf(think.sep) === -1){
          return;
        }
        if(path.extname(item) !== '.js'){
          return;
        }
        return true;
      }).map(item => {
        return item.slice(0, -3).replace(/\\/g, '/');
      }).sort((a, b) => {
        let al = a.split('/').length;
        let bl = b.split('/').length;
        if(al === bl){
          return a < b ? 1 : -1;
        }
        return al < bl ? 1 : -1;
      });
      if(subControllers.length){
        thinkData.subController[module] = subControllers;
      }
    });
  }
  /**
   * load bootstrap
   * @return {} []
   */
  loadBootstrap(){
    let paths = [
      `${think.THINK_LIB_PATH}${think.sep}bootstrap`,
      think.getPath(think.dirname.common, think.dirname.bootstrap)
    ];
    paths.forEach(item => {
      if (!think.isDir(item)) {
        return;
      }
      let files = fs.readdirSync(item);

      //must reload all bootstrap files.
      if (think.config('auto_reload')) {
        AutoReload.rewriteSysModuleLoad();
        var instance = new AutoReload(item, ()=>{});
        instance.clearFilesCache(files.map(file => item + think.sep + file));
      }

      files.forEach(file => {
        let extname = path.extname(file);
        if(extname !== '.js'){
          return;
        }
        think.safeRequire(`${item}${think.sep}${file}`);
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
      let files = think.getFiles(filepath, true);
      files.forEach(file => {
        let key = `${filepath}${think.sep}${file}`;
        data[key] = true;
      });
    };
    let {root_path} = think.config('view');
    if(root_path){
      add(path.normalize(root_path));
    }else{
      think.module.forEach(module => {
        add(think.getPath(module, think.dirname.view));
      });
    }
    thinkData.template = data;
  }
  /**
   * load system error message
   * @return {} []
   */
  loadError(){
    thinkData.error = think.safeRequire(think.THINK_LIB_PATH + `/config/sys/error.js`);
  }
  /**
   * clear all cache for reload
   * @return {void} []
   */
  clearData(){
    thinkData.alias = {};
    thinkData.export = {};
    thinkData.config = {};
    thinkData.hook = {};
    thinkData.template = {};
    thinkData.middleware = {};
    thinkData.subController = {};
    thinkData.route = null;
  }
  /**
   * load all config or modules
   * @return {} []
   */
  load(){
    
    this.loadConfig();
    this.loadRoute();
    this.loadAlias();
    this.loadAdapter();
    this.loadMiddleware();
    this.loadMVC();
    this.loadSubController();
    this.loadHook();
    this.loadTemplate();
    this.loadError();
    this.loadBootstrap();

    Checker.checkModuleConfig();

    think.toFastProperties(thinkData.alias);
    think.toFastProperties(thinkData.config);
    think.toFastProperties(thinkData.hook);
    think.toFastProperties(thinkData.middleware);
    think.toFastProperties(thinkData.error);
    think.toFastProperties(thinkData.template);
    think.toFastProperties(thinkData.subController);

    //console.log(thinkData.alias)
    //console.log(eval('%HasFastProperties(thinkData.template)'))
  }
  /**
   * capture error
   * @return {} []
   */
  captureError(){
    process.on('uncaughtException', err => {
      let msg = err.message;
      err = think.error(err, 'port:' + (think.port || think.config('port')));
      think.log(err);
      if(msg.indexOf(' EADDRINUSE ') > -1){
        process.exit();
      }
    });
    process.on('unhandledRejection', err => {
      if(think.isPrevent(err)){
        return;
      }
      if(think.config('log_unhandled_promise')){
        think.log(err);
      }
    });
  }
  /**
   * start
   * @return {} []
   */
  start(){
    Checker.checkNodeVersion();
    Checker.checkFileName();
    Checker.checkDependencies();
    
    this.load();
    this.captureError();
    if (think.config('auto_reload')) {
      this.autoReload();
    }
  }
  /**
   * auto reload user modified files
   * @return {} []
   */
  autoReload(){
    //it auto reload by watch compile
    if(this.compileCallback){
      return;
    }
    let instance = this.getReloadInstance();
    instance.run();
  }
  /**
   * get auto reload class instance
   * @param  {String} srcPath []
   * @return {Object}         []
   */
  getReloadInstance(srcPath){
    srcPath = srcPath || think.APP_PATH;
    AutoReload.rewriteSysModuleLoad();
    let instance = new AutoReload(srcPath, () => {
      this.clearData();
      this.load();
    });
    return instance;
  }
  /**
   * use babel compile code
   * @return {} []
   */
  compile(srcPath, outPath, options = {}){
    if(think.isObject(srcPath)){
      options = srcPath;
      srcPath = '';
    }else if(srcPath === true){
      options = {log: true};
      srcPath = '';
    }
    srcPath = srcPath || `${think.ROOT_PATH}${think.sep}src`;
    outPath = outPath || think.APP_PATH;

    if(!think.isDir(srcPath)){
      return;
    }
    let reloadInstance = this.getReloadInstance(outPath);
    let _getMode = false;
    this.compileCallback = changedFiles => {
      if(!_getMode){
        _getMode = true;
        //get app mode
        think.mode = this.getMode();
      }

      reloadInstance.clearFilesCache(changedFiles);
    };

    let instance = new WatchCompile(srcPath, outPath, options, this.compileCallback);
    instance.run();

    think.autoCompile = true;
    
    this.sourceMapSupport(true);
  }
  /**
   * source map support
   * @param  {} flag []
   * @return {}      []
   */
  async sourceMapSupport(flag){
    let support = await think.npm('source-map-support');
    let options = {
      environment: 'node',
      emptyCacheBetweenOperations: flag
    };
    return support.install(options);
  }
  /**
   * pre require
   * @return {} []
   */
  preload(){
    let startTime = Date.now();
    for(let name in thinkData.alias){
      think.require(thinkData.alias[name]);
    }
    think.log('preload packages finished', 'PRELOAD', startTime);
  }
  /**
   * run
   * @return {} []
   */
  run(preload){
    this.start();
    if(preload){
      this.preload();
    }
    return think.require('app').run();
  }
  /**
   * load, convenient for plugins
   * @return {} []
   */
  static load(options){
    let instance = new this(options);
    instance.load();
  }
}

module.exports = exports.default;