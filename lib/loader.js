const getConfigFn = require('think-config').getConfigFn;
const Logger = require('think-logger3');
const Loader = require('think-loader');
const path = require('path');
const helper = require('think-helper');
const Crontab = require('think-crontab');

require('./think.js');
// ThinkJS root path
const thinkPath = path.join(__dirname, '..');

/**
 * think loader
 * @param {Object} options 
 */
const thinkLoader = class {
  constructor(options = {}) {
    this.options = options;
  }
  /**
   * init path
   */
  initPath() {
    think.ROOT_PATH = this.options.ROOT_PATH;
    think.APP_PATH = this.options.APP_PATH;
    // set env
    if (this.options.env) {
      think.app.env = this.options.env;
    }
    // set proxy
    if (this.options.proxy) {
      think.app.proxy = this.options.proxy;
    }
  }
  /**
   * load app data
   */
  loadData() {
    // add data to koa application
    think.app.modules = think.loader.modules;
    think.app.controllers = think.loader.loadController();
    think.app.logics = think.loader.loadLogic();
    think.app.models = think.loader.loadModel();
    think.app.services = think.loader.loadService();
    think.app.routers = think.loader.loadRouter();
    think.app.validators = think.loader.loadValidator();
  }
  /**
   * load middleware
   */
  loadMiddleware() {
    const middlewares = think.loader.loadMiddleware(think.app);
    middlewares.forEach(middleware => {
      think.app.use(middleware);
    });
  }
  /**
   * load extend
   */
  loadExtend() {
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
      if (!exts[item[0]]) return;
      Loader.extend(item[1], exts[item[0]]);
    });
  }
  /**
   * load crontab
   */
  loadCrontab() {
    const crontab = think.loader.loadCrontab();
    const instance = new Crontab(crontab, think.app);
    instance.runTask();
  }
  /**
   * load all data
   */
  loadAll(type) {
    this.initPath();
    think.loader = new Loader(think.APP_PATH, thinkPath);
    think.config = getConfigFn(think.loader.loadConfig(think.app.env), think.loader.modules.length > 0);
    think.logger = new Logger(helper.parseAdapterConfig(think.config('logger')), true);

    if (type !== 'master') {
      this.loadExtend();
      this.loadData();
      this.loadMiddleware();
      if (!think.isCli) {
        this.loadCrontab();
      }
    }
    think.loader.loadBootstrap(type);
  }
};

module.exports = thinkLoader;
