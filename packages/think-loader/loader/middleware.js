const path = require('path');
const helper = require('think-helper');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`think-loader-middleware-${process.pid}`);

const SYS_MIDDLEWARES = {
  controller: require('thinkjs/lib/middleware/controller'),
  logic: require('thinkjs/lib/middleware/logic'),
  meta: require('thinkjs/lib/middleware/meta'),
  payload: require('thinkjs/lib/middleware/payload'),
  resource: require('thinkjs/lib/middleware/resource'),
  router: require('thinkjs/lib/middleware/router'),
  trace: require('thinkjs/lib/middleware/trace')
};
class Middleware extends require('../middleware') {
  interopRequire(path) {
    return interopRequire(path);
  }
  /**
   * get middlewares in middleware path
   * * [THINKJS_LIB_PATH]/lib/middleware
   * * [APP_PATH]/middleware or [APP_PATH]/common/middleware
   */
  getFiles(middlewarePath) {
    const ret = {};
    helper.getdirFiles(middlewarePath).forEach(file => {
      if (!/\.(?:js|es)$/.test(file)) {
        return;
      }
      const match = file.match(/(.+)\.\w+$/);
      if (match && match[1]) {
        const filepath = path.join(middlewarePath, file);
        debug(`load file: ${filepath}`);
        ret[match[1]] = this.interopRequire(filepath);
      }
    });
    return ret;
  }

  /**
   * load sys and app middlewares
   */
  loadFiles(appPath, isMultiModule) {
    const appMiddlewarePath = path.join(appPath, isMultiModule ? 'common/middleware' : 'middleware');
    const appMiddlewares = this.getFiles(appMiddlewarePath);
    const middlewares = Object.assign({}, SYS_MIDDLEWARES, appMiddlewares);
    return middlewares;
  }

  load(appPath, modules, app) {
    let filepath = '';
    if (modules.length) {
      filepath = path.join(appPath, 'common/config/middleware.js');
    } else {
      filepath = path.join(appPath, 'config/middleware.js');
    }
    if (!helper.isFile(filepath)) {
      return [];
    }
    debug(`load file: ${filepath}`);
    const middlewares = this.interopRequire(filepath);
    return this.parse(middlewares, this.loadFiles(appPath, modules.length), app);
  }
}

module.exports = Middleware;
