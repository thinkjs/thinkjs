const helper = require('think-helper');
const debug = require('debug')('think-loader@router');
const methods = require('methods');
const path = require('path');
const assert = require('assert');

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
   * resource
   */
  resource(match, path){
    this.rules.push({match, path, method: 'resource'});
    return this;
  }
  /**
   * delete method
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
  Router.prototype[method] = (match, path) => {
    this.rules.push({match, path, method: method});
    return this;
  }
});

/**
 * format rules
 * [
 *  [/\w/, 'home/index', 'get']
 * ]
 * 
 *  => [{
 *  match: /\w/,
 *  path: 'home/index',
 *  method: 'get'
 * }]
 */
const formatRouter = router => {
  if(helper.isFunction(router)){
    let routerInstance = new Router();
    router = router(routerInstance);
    if(routerInstance.rules.length){
      return routerInstance.rules;
    }
    return router; //may be a promise
  }else if(helper.isArray(router)){
    return router.map(rule => {
      if(helper.isArray(rule)){
        return {
          match: rule[0],
          path: rule[1],
          method: (rule[2] || '').toLowerCase()
        }
      }
      return rule;
    });
  }
  return router;
}

/**
 * route loader
 * @return {Promise}
 */
function loader(appPath, isMultiModule){
  if(isMultiModule){
    let commonRouterFile = path.join(appPath, 'common/config/router.js');
    if(!helper.isFile(commonRouterFile)){
      return [];
    }
    let commonRouter = require(commonRouterFile);
    if(helper.isFunction(commonRouter) || helper.isArray(commonRouter)){
      debug('common/config/router is an array or a function');
      return formatRouter(commonRouter);
    }
    /**
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
    for(let name in commonRouter){
      assert(commonRouter[name].match, `common/config/router: ${name}.match must be set`);
      let moduleRouterFile = path.join(appPath, name, 'config/router.js');
      if(!helper.isFile(moduleRouterFile)){
        continue;
      }
      let moduleRouter = require(moduleRouterFile);
      commonRouter[name].rules = formatRouter(moduleRouter);
    }
    return commonRouter;
  }else{
    let routerFile = path.join(appPath, 'config/router.js');
    if(!helper.isFile(routerFile)){
      return [];
    }
    let router = require(routerFile);
    assert(helper.isFunction(router) || helper.isArray(router), 'config/router must be an array or a function');
    return formatRouter(router);
  }
}

module.exports = loader;