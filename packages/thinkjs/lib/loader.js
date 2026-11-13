const getConfigFn = require('think-config').getConfigFn;
const Logger = require('think-logger3');
const Loader = require('think-loader');
const path = require('path');
const helper = require('think-helper');
const Crontab = require('think-crontab');
const fs = require('fs');
const assert = require('assert');

require('./think.js');
// ThinkJS root path
const thinkPath = path.join(__dirname, '..');

/**
 * think loader
 * @param {Object} options
 */
const thinkLoader = class extends require('./core/loader') {
  constructor(options = {}) {
    super();
    this.options = options;
  }
  /**
   * init path
   */
  initPath() {
    think.ROOT_PATH = this.options.ROOT_PATH;
    think.APP_PATH = this.options.APP_PATH;
    think.RUNTIME_PATH = this.options.RUNTIME_PATH;

    // set env
    if (this.options.env) {
      think.app.env = this.options.env;
    }
    // set proxy
    if (this.options.proxy) {
      think.app.proxy = this.options.proxy;
    }

    // Sync from Koa https://github.com/koajs/koa/blob/master/lib/application.js#LL80C5-L84C6
    if (this.options.asyncLocalStorage) {
      const { AsyncLocalStorage } = require('async_hooks');
      assert(AsyncLocalStorage, 'Requires node 12.17.0 or higher to enable asyncLocalStorage');
      think.app.ctxStorage = new AsyncLocalStorage();
    }
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
   * write config to file
   * @param {Config} config
   */
  writeConfig(config) {
    const configFilepath = path.join(think.RUNTIME_PATH, 'config');
    helper.mkdir(configFilepath);
    fs.writeFileSync(`${configFilepath}/${think.app.env}.json`, JSON.stringify(config, undefined, 2));
  }
  /**
   * load all data
   */
  loadAll(type, isCli) {
    this.initPath();
    think.loader = new Loader(think.APP_PATH, thinkPath);

    // write config to APP_PATH/runtime/config/[env].json file
    const config = think.loader.loadConfig(think.app.env);
    think.config = getConfigFn(config, think.loader.modules.length > 0);
    think.logger = new Logger(helper.parseAdapterConfig(think.config('logger')), true);

    if (type !== 'master') {
      this.writeConfig(config);
      this.loadExtend();
      this.loadData();
      this.loadMiddleware();
      if (!isCli) {
        this.loadCrontab();
      }
    }
    think.loader.loadBootstrap(type);
  }
};

module.exports = thinkLoader;
