const Router = require('./router.js');
const helper = require('think-helper');

/**
 * default options
 */
const defaultOptions = {
  defaultModule: 'home',
  defaultController: 'index',
  defaultAction: 'index',
  prefix: [], // url prefix
  suffix: ['.html'], // url suffix
  enableDefaultRouter: true,
  subdomainOffset: 2,
  subdomain: {}, //subdomain
  denyModules: [] //enable in multi module
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
  return (ctx, next) => {
    let instance = new Router(ctx, next, options, app);
    return instance.run();
  } 
};