'use strict';

import fs from 'fs';
import path from 'path';
import './core/think.js';

let {sep} = path;

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
    let APP_PATH = `${ROOT_PATH}${sep}app`;
    let RUNTIME_PATH = ROOT_PATH + sep + think.dirname.runtime;
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
   * check node version
   * @return {} []
   */
  checkNodeVersion(){
    let packageFile = `${think.THINK_PATH}/package.json`;
    let {engines} = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
    let needVersion = engines.node.substr(2);

    let nodeVersion = process.version;
    if(nodeVersion[0] === 'v'){
      nodeVersion = nodeVersion.slice(1);
    }

    if(needVersion > nodeVersion){
      think.log(colors => {
        return `${colors.red('[ERROR]')} ThinkJS need node version >= ${needVersion}, current version is ${nodeVersion}, please upgrade it.`;
      });
      console.log();
      process.exit();
    }
  }
  /**
   * check application filename is lower
   * @return {} []
   */
  checkFileName(){
    let files = think.getFiles(think.APP_PATH, true);
    let reg = /\.(js|html|tpl)$/;
    let uppercaseReg = /[A-Z]+/;
    let localPath = `${sep}${think.dirname.locale}${sep}`;
    let filter = item => {
      if(!reg.test(item)){
        return;
      }
      item = path.normalize(item);
      //ignore files in config/locale
      if(item.indexOf(localPath) > -1){
        return;
      }
      return true;
    };
    files.forEach(item => {
      if(filter(item) && uppercaseReg.test(item)){
        think.log(colors => {
          return colors.yellow(`[WARNING]`) + ` file \`${item}\` has uppercase chars.`;
        });
      }
    });
  }
  /**
   * check dependencies is installed before server start
   * @return {} []
   */
  checkDependencies(){
    let packageFile = think.ROOT_PATH + '/package.json';
    if(!think.isFile(packageFile)){
      return;
    }
    let data = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    let dependencies = data.dependencies;
    let pkgPath = `${think.ROOT_PATH}${sep}node_modules${sep}`;
    for(let pkg in dependencies){
      if(think.isDir(`${pkgPath}${pkg}`)){
        continue;
      }
      try{
        require(pkg);
      }catch(e){
        think.log(colors => {
          let msg = colors.red('[ERROR]') + ` package \`${pkg}\` is not installed. `;
          msg += 'please run `npm install` command before start server.';
          return msg;
        }, '', null);
        console.log();
        process.exit();
      }
    }
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
    thinkData.alias = require(aliasPath);
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
   * check module config
   * @return {} []
   */
  checkModuleConfig(){
    if(think.mode !== think.mode_module){
      return;
    }
    // check module config
    // some config must be set in common module
    let keys = [], errorKey = 'error_config_key';
    let errorConfigKeys = thinkCache(thinkCache.COLLECTION, errorKey);
    if(think.isEmpty(errorConfigKeys)){
      thinkCache(thinkCache.COLLECTION, errorKey, []);
      errorConfigKeys = thinkCache(thinkCache.COLLECTION, errorKey);
    }

    let checkMConfig = module => {
      if(keys.length === 0){
        keys = Object.keys(require(`${think.THINK_LIB_PATH}/config/config.js`));
      }
      let configFilePath = think.getPath(module, think.dirname.config) + '/config.js';
      if(!think.isFile(configFilePath)){
        return;
      }
      let config = require(configFilePath);
      keys.forEach(key => {
        if(config[key] && errorConfigKeys.indexOf(key) === -1){
          errorConfigKeys.push(key);
          think.log(colors => {
            return colors.red(`config key \`${key}\` can not be set in \`${module}\` module, must be set in \`common\` module`);
          }, 'CONFIG');
        }
      });
    };

    let modules = this.getModule();
    //load modules config
    modules.forEach(module => {
      if(module !== 'common'){
        checkMConfig(module);
      }
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
      `${think.THINK_LIB_PATH}${sep}middleware`,
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
    thinkData.hook = think.extend({}, require(hookPath));

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
      think.alias(itemType, `${think.THINK_LIB_PATH}${sep}${itemType}`);
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
      `${think.THINK_LIB_PATH}${sep}bootstrap`,
      think.getPath(think.dirname.common, think.dirname.bootstrap)
    ];
    paths.forEach(item => {
      if (!think.isDir(item)) {
        return;
      }
      let files = fs.readdirSync(item);

      //must reload all bootstrap files.
      if (think.config('auto_reload')) {
        var AutoReload = require('./util/auto_reload.js');
        AutoReload.rewriteSysModuleLoad();
        var instance = new AutoReload(item, ()=>{});
        instance.clearFilesCache(files.map(file => item + '/' + file));
      }

      files.forEach(file => {
        let extname = path.extname(file);
        if(extname !== '.js'){
          return;
        }
        think.safeRequire(`${item}${sep}${file}`);
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
        let key = `${filepath}${sep}${file}`;
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
    thinkData.error = require(think.THINK_LIB_PATH + `/config/sys/error.js`);
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

    this.checkModuleConfig();

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
      err = think.error(err, 'port:' + think.config('port'));
      think.log(err);
      if(msg.indexOf(' EADDRINUSE ') > -1){
        process.exit();
      }
    });
    process.on('unhandledRejection', err => {
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
    this.checkDependencies();
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
    let AutoReload = require('./util/auto_reload.js');
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
    srcPath = srcPath || `${think.ROOT_PATH}${sep}src`;
    outPath = outPath || think.APP_PATH;

    if(!think.isDir(srcPath)){
      return;
    }
    let reloadInstance = this.getReloadInstance(outPath);
    this.compileCallback = changedFiles => {
      reloadInstance.clearFilesCache(changedFiles);
    };

    let WatchCompile = require('./util/watch_compile.js');
    let instance = new WatchCompile(srcPath, outPath, options, this.compileCallback);
    instance.run();

    think.autoCompile = true;
    //get app mode
    think.mode = this.getMode();
  }
  /**
   * run
   * @return {} []
   */
  run(){
    this.start();
    return think.require('app').run();
  }
  /**
   * load, convenient for plugins
   * @return {} []
   */
  static load(){
    let instance = new this();
    instance.load();
  }
}