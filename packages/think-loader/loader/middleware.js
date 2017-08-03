const path = require('path');
const helper = require('think-helper');
const interopRequire = require('./util.js').interopRequire;
const assert = require('assert');
const pathToRegexp = require('path-to-regexp');
const debug = require('debug')(`think-loader-middleware-${process.pid}`);

class Middleware {
  interopRequire(path) {
    return interopRequire(path);
  }
  /**
   * check url matched
   */
  createRegexp(match) {
    if (helper.isFunction(match)) return match;
    if (match) return pathToRegexp(match);
  }
  /**
   * check rule match
   */
  checkMatch(rule, ctx) {
    if (helper.isFunction(rule)) return rule(ctx);
    return rule.test(ctx.path);
  }
  /**
   * middleware rules(appPath/middleware.js):
   * module.exports = [
   *  'clean_pathname',
   * {
   *    handle: denyIp,
   *    options: {},
   *    enable: false,
   *    match: '',
   *    ignore: ''
   * },
   * ]
   */
  parse(middlewares = [], middlewarePkg = {}, app) {
    return middlewares.map(item => {
      if (helper.isString(item)) {
        return {handle: item};
      }
      if (helper.isFunction(item)) {
        return {handle: () => item};
      }
      return item;
    }).filter(item => {
      return !('enable' in item) || item.enable;
    }).map(item => {
      if (helper.isString(item.handle)) {
        item.handle = middlewarePkg[item.handle];
      }
      assert(helper.isFunction(item.handle), 'handle must be a function');
      const options = item.options || {};
      let handle = item.handle;
      // if options is a function, maybe want get options async
      // then hack a middleware handle, when app is ready, then get options & exec handle
      if (helper.isFunction(options)) {
        let ret = {};
        app.think.beforeStartServer(() => {
          return Promise.resolve(options()).then(data => {
            ret = data;
          });
        });
        app.on('appReady', () => {
          handle = handle(ret, app);
        });
        item.handle = (ctx, next) => {
          return handle(ctx, next);
        };
      } else {
        item.handle = handle(options, app);
        // handle also be a function
        assert(helper.isFunction(item.handle), 'handle must return a function');
      }
      return item;
    }).map(item => {
      if (!item.match && !item.ignore) {
        return item.handle;
      }

      // create regexp here for better performance
      const match = this.createRegexp(item.match);
      const ignore = this.createRegexp(item.ignore);

      // has match or ignore
      return (ctx, next) => {
        if ((match && !this.checkMatch(match, ctx)) ||
            (ignore && this.checkMatch(ignore, ctx))) {
          return next();
        }
        return item.handle(ctx, next);
      };
    });
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
  loadFiles(appPath, isMultiModule, thinkPath) {
    const sysMiddlewares = this.getFiles(path.join(thinkPath, 'lib/middleware'));
    const appMiddlewarePath = path.join(appPath, isMultiModule ? 'common/middleware' : 'middleware');
    const appMiddlewares = this.getFiles(appMiddlewarePath);
    const middlewares = Object.assign({}, sysMiddlewares, appMiddlewares);
    return middlewares;
  }

  load(appPath, thinkPath, modules, app) {
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
    return this.parse(middlewares, this.loadFiles(appPath, modules.length, thinkPath), app);
  }
}

module.exports = Middleware;
