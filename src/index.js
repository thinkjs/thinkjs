'use strict';

import fs from 'fs';
import path from 'path';
import './core/think.js';

//babel not export default property
//so can not use `import babel from 'babel-core'`
let babel = require('babel-core');

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
      let files = fs.readdirSync(filepath);
      let flag = files.some(file => {
        if (think.isDir(`${filepath}/${file}`)) {
          return true;
        }
      });
      return flag ? think.mode_normal : think.mode_mini;
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
    let files = think.getFiles(think.APP_PATH);
    let reg = /\.(js|html|tpl)$/;
    let uppercaseReg = /[A-Z]+/;
    let filter = item => {
      if(!reg.test(item)){
        return;
      }
      //ignore files in config/locale
      if(item.indexOf(`/${think.dirname.locale}/`) > -1){
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
   * check module config
   * @return {} []
   */
  checkModuleConfig(){
    // check module config
    // some config must be set in common module
    let keys = [], errorKey = 'error_config_key';
    let errorConfigKeys = thinkCache(thinkCache.COLLECTION, errorKey);
    if(think.isEmpty(errorConfigKeys)){
      thinkCache(thinkCache.COLLECTION, errorKey, []);
      errorConfigKeys = thinkCache(thinkCache.COLLECTION, errorKey);
    }

    let checkModuleConfig = module => {
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
      if(think.mode === think.mode_module && module !== 'common'){
        checkModuleConfig(module);
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
    let hook = think.extend({}, require(hookPath));
    let file = `${think.getPath(undefined, think.dirname.config)}/hook.js`;
    let data = think.extend({}, think.safeRequire(file));
    let key, value;
    for(key in data){
      value = data[key];
      if (!(key in hook)) {
        hook[key] = data[key];
      }else if (value[0] === 'append' || value[0] === 'prepend') {
        let flag = value.shift();
        if (flag === 'append') {
          hook[key] = hook[key].concat(value);
        }else{
          hook[key] = value.concat(hook[key]);
        }
      }else{
        hook[key] = value;
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
      model: ['base', 'relation', 'mongo', 'adv'],
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
    let {root_path} = think.config('view');
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
    //clear all cache for reload
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

    this.checkModuleConfig();

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
    /**
     * log reload file
     * @param  {String} file []
     * @return {}      []
     */
    let log = file => {
      if(!think.config('log_auto_reload') || !file){
        return;
      }
      //only log app files changed
      if(file.indexOf(think.APP_PATH) === 0){
        file = file.slice(think.APP_PATH.length);
        think.log(`reload file ${file}`, 'RELOAD');
      }
    };

    /**
     * check change form cache
     * @return {} []
     */
    let checkCacheChange = () => {
      let hasChange = false;
      for(let file in require.cache){
        if(!think.isFile(file)){
          clearFileCache(file);
          continue;
        }
        let mTime = fs.statSync(file).mtime.getTime();
        if(!autoReload[file]){
          autoReload[file] = mTime;
          continue;
        }
        if(mTime > autoReload[file]){
          clearFileCache(file);
          autoReload[file] = mTime;
          hasChange = true;
          log(file);
        }
      }
      return hasChange;
    };
    /**
     * check change from file
     * @return {} []
     */
    let prevFilesLength = 0;
    let checkFileChange = () => {
      let nowFilesLength = think.getFiles(think.APP_PATH).filter(file => {
        let extname = path.extname(file);
        return extname === '.js';
      }).length;
      let flag = prevFilesLength === nowFilesLength;
      prevFilesLength = nowFilesLength;
      return flag;
    };

    setInterval(() => {
      let hasChange = checkCacheChange() || checkFileChange();
      if(hasChange){
        this.load();
      }
    }, 200);
  }
  /**
   * capture error
   * @return {} []
   */
  captureError(){
    process.on('uncaughtException', function(err){
      let msg = err.message;
      err = think.error(err, 'port:' + think.config('port'));
      think.log(err);
      if(msg.indexOf(' EADDRINUSE ') > -1){
        process.exit();
      }
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
  /**
   * use babel compile code
   * @return {} []
   */
  compile(srcPath, outPath, disableWatch){
    srcPath = srcPath || `${think.ROOT_PATH}/src`;
    outPath = outPath || `${think.ROOT_PATH}/app`;

    if(!think.isDir(srcPath)){
      return;
    }
    
    think.autoCompile = true;

    //store compiled files last mtime
    let compiledMtime = {};

    //compile single file
    let compileFile = (file, onlyCopy) => {
      let filePath = `${srcPath}/${file}`;
      let content = fs.readFileSync(filePath, 'utf8');
      if(!content){
        return;
      }
      if(onlyCopy){
        fs.writeFileSync(`${outPath}/${file}`, content);
        return;
      }
      let startTime = Date.now();
      try{
        let data = babel.transform(content, {
          retainLines: true,
          stage: 0,
          modules: 'common',
          loose: true,
          optional: 'runtime'
        });
        think.log(`compile file ${file}`, 'BABEL', startTime);
        think.mkdir(path.dirname(`${outPath}/${file}`));
        fs.writeFileSync(`${outPath}/${file}`, data.code);
      }catch(e){
        think.log(colors => {
          return colors.red(`compile file ${file} error`);
        }, 'BABEL');
        think.log(e);
      }
    };
    
    let fn = () => {
      let files = think.getFiles(srcPath);
      files.forEach(function(file){
        var extname = path.extname(file);
        if(extname !== '.js'){
          compileFile(file, true);
          return;
        }
        var mTime = fs.statSync(`${srcPath}/${file}`).mtime.getTime();
        if(!compiledMtime[file] || mTime > compiledMtime[file]){
          compileFile(file);
          compiledMtime[file] = mTime;
          return;
        }
      });
    };

    if(disableWatch){
      fn();
    }else{
      setInterval(fn, 100);
    }
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