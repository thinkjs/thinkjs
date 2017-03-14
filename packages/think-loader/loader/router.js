const helper = require('think-helper');
const debug = require('debug')('think-loader@router');
const methods = require('methods');
const path = require('path');
const assert = require('assert');
const interopRequire = require('./util.js').interopRequire;
const pathToRegexp = require('path-to-regexp');

/**
 * Router class
 */
const Router = class {
  constructor(){
    this.rules = [];
  }
  /**
   * verbose
   */
  verb(match, path){
    this.rules.push({match, path});
    return this;
  }
  /**
   * redirect
   */
  redirect(match, path, statusCode = 302){
    this.rules.push({match, path, method: 'redirect', statusCode});
    return this;
  }
  /**
   * REST resource
   */
  rest(match, path){
    this.rules.push({match, path, method: 'rest'});
    return this;
  }
  /**
   * delete method, alias delete
   */
  del(match, path){
    this.rules.push({match, path, method: 'delete'});
    return this;
  }
}
/**
 *  @name get|put|post|patch|delete
 */
methods.forEach(method => {
  // can not use arrow function in here!
  Router.prototype[method] = function(match, path){
    this.rules.push({match, path, method: method});
    return this;
  }
});

const RouterLoader = {
  Router: Router,
  /**
   * format rules
   *  => [{
   *  match: /\w/,
   *  path: 'home/index',
   *  method: 'get'
   *  statusCode: ?
   * }]
   */
  formatRouter(router){
    if(helper.isFunction(router)){
      let routerInstance = new RouterLoader.Router();
      router(routerInstance);
      router = routerInstance.rules;
    }
    assert(helper.isArray(router), 'router must be an array');
    return router.map(item => {
      item.query = [];
      //convert string match to RegExp
      item.match = pathToRegexp(item.match, item.query);
      return item;
    });
  },

  /**
   * route loader
   */
  load(appPath, modules){
    const formatRouter = RouterLoader.formatRouter;
    if(modules.length){
      let commonRouterFile = path.join(appPath, 'common/config/router.js');
      if(!helper.isFile(commonRouterFile)){
        return [];
      }
      let commonRouter = interopRequire(commonRouterFile);
      if(helper.isFunction(commonRouter) || helper.isArray(commonRouter)){
        debug('common/config/router is an array or a function');
        return formatRouter(commonRouter);
      }
      /**
       * rules in multi module
       * rule = {
       *    home: {
       *      match: '',
       *      rules: []
       *    },
       *    admin: {
       *      match: '',
       *      rules: []
       *    }
       * }
       */
      debug('load module router');
      for(let name in commonRouter){
        let match = commonRouter[name].match;
        assert(!match, `common/config/router: ${name}.match must be set`);
        let moduleRouterFile = path.join(appPath, name, 'config/router.js');
        commonRouter[name].match = pathToRegexp(match);
        if(!helper.isFile(moduleRouterFile)){
          commonRouter[name].rules = [];
          continue;
        }
        let moduleRouter = interopRequire(moduleRouterFile);
        commonRouter[name].rules = formatRouter(moduleRouter);
      }
      return commonRouter;
    }else{
      let routerFile = path.join(appPath, 'config/router.js');
      if(!helper.isFile(routerFile)){
        return [];
      }
      let router = interopRequire(routerFile);
      assert(helper.isFunction(router) || helper.isArray(router), 'config/router must be an array or a function');
      return formatRouter(router);
    }
  }
}

module.exports = RouterLoader;