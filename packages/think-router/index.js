const Router = require('./router.js');
const helper = require('think-helper');
const pathToRegexp = require('path-to-regexp');
const debug = require('debug')('think-router');

/**
 * default options
 */
const defaultOptions = {
  defaultModule: 'home', //default module name, is enable in multi module mode
  defaultController: 'index', //default controller name
  defaultAction: 'index', //default action name
  prefix: [], // url prefix
  suffix: ['.html'], // url suffix
  enableDefaultRouter: true,
  subdomainOffset: 2, 
  subdomain: {}, //subdomain
  denyModules: [] //deny module, enable in multi module mode
}

/**
 * format routers
 * @param {Array|Object} routers 
 */
const formatRouters = routers => {
  if(helper.isArray(routers)){
    return routers.map(item => {
      let query = [];
      let match = pathToRegexp(item[0], query);
      return {
        match, 
        path: item[1], 
        method: item[2], 
        options: item[3] || {}, 
        query
      };
    });
  }
  for(let m in routers){
    if(routers[m].match){
      routers[m].match = pathToRegexp(routers[m].match);
    }
    routers[m].rules = formatRouters(routers[m].rules);
  }
  return routers;
}

/**
 * parse router
 */
module.exports = function parseRouter(options, app){
  options = Object.assign(defaultOptions, options);
  //set subdomain offset
  if(options.subdomainOffset){
    app.subdomainOffset = options.subdomainOffset;
  }
  //change subdomain array to object
  //subdomain: ['admin', 'user'] => {admin: 'admin', user: 'ussr'}
  if(helper.isArray(options.subdomain)){
    let subdomain = {};
    options.subdomain.forEach(item => {
      subdomain[item] = item;
    });
    options.subdomain = subdomain;
  }
  //format routers when app ready
  app.once('appReady', () => {
    debug('router listen appReady event');
    app.routers = formatRouters(app.routers);
  });
  return (ctx, next) => {
    let instance = new Router(ctx, next, options, app);
    return instance.run();
  } 
};