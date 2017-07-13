const helper = require('think-helper');
const path = require('path');
const fs = require('fs');
const Config = require('./loader/config.js');
const bootstrap = require('./loader/bootstrap.js');
const Middleware = require('./loader/middleware.js');
const router = require('./loader/router.js');
const extend = require('./loader/extend.js');
const common = require('./loader/common.js');
const crontab = require('./loader/crontab.js');
const extendMethod = require('./loader/util.js').extend;
const validator = require('./loader/validator.js');

/**
 * Loader
 */
class Loader {
  /**
   * constructor
   */
  constructor(appPath, thinkPath) {
    this.appPath = appPath;
    this.thinkPath = thinkPath;
    this.modules = [];
    const dir = path.join(appPath, 'common/config');
    if (helper.isDirectory(dir)) {
      this.modules = fs.readdirSync(appPath).filter(item => {
        const stat = fs.statSync(path.join(appPath, item));
        return stat.isDirectory();
      });
    }
  }
  /**
   * load config
   */
  loadConfig(env) {
    return (new Config()).load(this.appPath, this.thinkPath, env, this.modules);
  }
  /**
   * load bootstrap
   */
  loadBootstrap(type) {
    return bootstrap(this.appPath, this.modules, type);
  }
  /**
   * load controller
   */
  loadController() {
    return common.load(this.appPath, 'controller', this.modules);
  }
  /**
   * load logic
   */
  loadLogic() {
    return common.load(this.appPath, 'logic', this.modules);
  }
  /**
   * load model
   */
  loadModel() {
    return common.load(this.appPath, 'model', this.modules);
  }
  /**
   * load service
   */
  loadService() {
    return common.load(this.appPath, 'service', this.modules);
  }

  /**
   * load middleware
   */
  loadMiddleware(app) {
    return (new Middleware()).load(this.appPath, this.thinkPath, this.modules, app);
  }
  /**
   * load router
   */
  loadRouter() {
    return router.load(this.appPath, this.modules);
  }
  /**
   * load extend
   */
  loadExtend() {
    return extend.load(this.appPath, this.thinkPath, this.modules);
  }
  /**
   * load crontab
   */
  loadCrontab() {
    return crontab(this.appPath, this.modules);
  }
  /**
   * load use defined file
   */
  loadCommon(name) {
    return common.load(this.appPath, name, this.modules);
  }
  /**
   * load validator
   */
  loadValidator() {
    return validator(this.appPath, this.modules);
  }
}

Loader.extend = extendMethod;

module.exports = Loader;
