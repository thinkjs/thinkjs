const path = require('path');
const helper = require('think-helper');
const interopRequire = require('./util.js').interopRequire;
const assert = require('assert');
const pathToRegexp = require('path-to-regexp');

class Middleware {
  interopRequire(path) {
    return interopRequire(path);
  }
  /**
   * check url matched
   */
  createRegexp(match){
    if(match) {
      return pathToRegexp(match);
    }
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
  parse(middlewares = [], middlewarePkg = {}, app){
    return middlewares.map(item => {
      if(helper.isString(item)){
        return {handle: item};
      }
      return item;
    }).filter(item => {
      return !('enable' in item) || item.enable;
    }).map(item => {
      if(helper.isString(item.handle)){
        item.handle = middlewarePkg[item.handle];
      }
      assert(helper.isFunction(item.handle), 'handle must be a function');
      item.handle = item.handle(item.options || {}, app);
      // handle also be a function
      assert(helper.isFunction(item.handle), 'handle must return a function');
      return item;
    }).map(item => {
      if(!item.match && !item.ignore){
        return item.handle;
      }

      // create regexp here for better performance
      const matchRegexp = this.createRegexp(item.match);
      const ignoreRegexp = this.createRegexp(item.ignore);

      // has match or ignore
      return (ctx, next) => {
        if(matchRegexp && !matchRegexp.test(ctx.path) ||
            ignoreRegexp && ignoreRegexp.test(ctx.path) ) {
          return next();
        }
        return item.handle(ctx, next);
      }
    })
  }

  /**
   * get middlewares in middleware path
   * * [THINKJS_LIB_PATH]/lib/middleware
   * * [APP_PATH]/middleware or [APP_PATH]/common/middleware
   */
  getFiles(middlewarePath){
    let ret = {};
    helper.getdirFiles(middlewarePath).forEach(file => {
      if(!/\.(?:js|es)$/.test(file)){
        return;
      }
      let match = file.match(/(\w+)\.\w+$/);
      if(match && match[1]){
        ret[match[1]] = this.interopRequire(path.join(middlewarePath, file));
      }
    });
    return ret;
  }

  /**
   * load sys and app middlewares
   */
  loadFiles(appPath, isMultiModule, thinkPath){
    let sysMiddlewares = this.getFiles(path.join(thinkPath, 'lib/middleware'));
    let appMiddlewarePath = path.join(appPath, isMultiModule ? 'common/middleware' : 'middleware');
    let appMiddlewares = this.getFiles(appMiddlewarePath);
    let middlewares = Object.assign({}, sysMiddlewares, appMiddlewares);
    return middlewares;
  }

  load(appPath, thinkPath, modules, app){
    let filepath = '';
    if(modules.length){
      filepath = path.join(appPath, 'common/config/middleware.js');
    }else{
      filepath = path.join(appPath, 'config/middleware.js');
    }
    if(!helper.isFile(filepath)){
      return [];
    }
    const middlewares = this.interopRequire(filepath);
    return this.parse(middlewares, this.loadFiles(appPath, modules.length, thinkPath), app);
  }
}

module.exports = Middleware;