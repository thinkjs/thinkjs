'use strict';

/**
 * load route
 * route detail config
 *
 * module.exports = {
 *   admin: {
 *     reg: /^admin/, //module reg
 *     children: [
 *       /^admin\/reg/, 'admin/index/reg'
 *     ]
 *   },
 *   home: {
 *     children: [
 *       
 *     ]
 *   }
 * }
 * 
 * @return {} []
 */
let _getDynamicRoute = fn => {
  return think.co(fn()).then((route = []) => {
    thinkData.route = route;
    return route;
  });
};

let _getModuleRoute = config => {
  for(let module in config){
    let filepath = think.getPath(module, think.dirname.config) + '/route.js';
    let moduleConfig = think.safeRequire(filepath);
    config[module].children = moduleConfig || [];
  }
  thinkData.route = config;
  return config;
};
/**
 * get route
 * @param  {} key []
 * @return {}     []
 */
let _getRoute = () => {
  let file = think.getPath(undefined, think.dirname.config) + '/route.js';
  let config = think.safeRequire(file) || [];

  //route config is funciton, may be is dynamic save in db
  if (think.isFunction(config)) {
    return _getDynamicRoute(config);
  }
  //get module route config
  if(think.isObject(config) && think.mode === think.mode_module){
    return _getModuleRoute(config);
  }
  thinkData.route = config;
  return config;
};

let Route = routes => {
  //remove route
  if(routes === null){
    thinkData.route = null;
    return;
  }
  //set route
  if (think.isArray(routes) || think.isObject(routes)) {
    thinkData.route = routes;
    return;
  }
  //get route
  if (thinkData.route) {
    return thinkData.route;
  }
  return _getRoute();
};

export default Route;