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
  constructor(appPath) {
    this.appPath = appPath;
    this.modules = [];
    const dir = path.join(appPath, 'common/config');
    if (helper.isDirectory(dir)) {
      this.modules = fs.readdirSync(appPath).filter(item => {
        const stat = fs.statSync(path.join(appPath, item));
        return stat.isDirectory();
      });
    }
  }
  loadConfig(env) {
    return (new Config()).load(this.appPath, env, this.modules);
  }
  loadBootstrap(type) {
    return bootstrap(this.appPath, this.modules, type);
  }
  loadController() {
    return common.load(this.appPath, 'controller', this.modules);
  }
  loadLogic() {
    return common.load(this.appPath, 'logic', this.modules);
  }
  loadModel() {
    return common.load(this.appPath, 'model', this.modules);
  }
  loadService() {
    return common.load(this.appPath, 'service', this.modules);
  }
  loadMiddleware(app) {
    return (new Middleware()).load(this.appPath, this.modules, app);
  }
  loadRouter() {
    return router.load(this.appPath, this.modules);
  }
  loadExtend() {
    return extend.load(this.appPath, this.modules);
  }
  loadCrontab() {
    return crontab(this.appPath, this.modules);
  }
  loadCommon(name) {
    return common.load(this.appPath, name, this.modules);
  }
  loadValidator() {
    return validator(this.appPath, this.modules);
  }
}

Loader.extend = extendMethod;

module.exports = Loader;
