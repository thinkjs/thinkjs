const getConfigFn = require('think-config').getConfigFn;
const Logger = require('think-logger3');
const assert = require('assert');
const Loader = require('think-loader');
const path = require('path');
const helper = require('think-helper');
const Crontab = require('think-crontab');
const debug = require('debug')('think');

require('./think.js');
// ThinkJS root path
const thinkPath = path.join(__dirname, '..');

/**
 * think loader
 * @param {Object} options 
 */
const thinkLoader = class {
  constructor(options = {}){
    this.options = options;
  }
  /**
   * init path
   */
  initPath(){
    think.ROOT_PATH = this.options.ROOT_PATH;
    think.APP_PATH = this.options.APP_PATH;
    if(this.options.env){
      think.app.env = this.options.env;
    }
    if(this.options.proxy){
      think.app.proxy = this.options.proxy;
    }
  }
  /**
   * load app data
   */
  loadData(){
    let config = think.loader.loadConfig(think.app.env);
    let modules = think.loader.modules;

    think.config = getConfigFn(config, modules.length > 0);
    let loggerConfig = helper.parseAdapterConfig(think.config('logger'));
    think.logger = new Logger(loggerConfig);
    
    //add data to koa application
    think.app.modules = modules;
    think.app.controllers = think.loader.loadController();
    think.app.logics = think.loader.loadLogic();
    think.app.models = think.loader.loadModel();
    think.app.services = think.loader.loadService();
    think.app.routers = think.loader.loadRouter();
  }
  /**
   * load middleware
   */
  loadMiddleware(){
    const middlewares = think.loader.loadMiddleware(think.app);
    if(debug.enabled){
      think.logger.info(middlewares);
    }
    middlewares.forEach(middleware => {
      think.app.use(middleware);
    });
  }
  /**
   * load extend
   */
  loadExtend(){
    let exts = think.loader.loadExtend();
    const list = [
      ['think', think],
      ['application', think.app],
      ['context', think.app.context],
      ['request', think.app.request],
      ['response', think.app.response],
      ['controller', think.Controller.prototype],
      ['logic', think.Logic.prototype]
    ];
    list.forEach(item => {
      if(!exts[item[0]]) return;
      Loader.extend(item[1], exts[item[0]]);
    });
  }
  /**
   * load crontab
   */
  loadCrontab(){
    const crontab = think.loader.loadCrontab();
    const instance = new Crontab(crontab, think.app);
    instance.runTask();
  }
  /**
   * load all data
   */
  loadAll(){
    this.initPath();
    think.loader = new Loader(think.APP_PATH, thinkPath, think.app);
    this.loadData();
    this.loadExtend();
    this.loadMiddleware();
    this.loadCrontab();
    think.loader.loadBootstrap();
  }
}

module.exports = thinkLoader;