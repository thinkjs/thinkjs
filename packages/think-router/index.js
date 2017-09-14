const Router = require('./router.js');
const helper = require('think-helper');
const pathToRegexp = require('path-to-regexp');

/**
 * default options
 */
const defaultOptions = {
  defaultModule: 'home', // default module name, is enable in multi module mode
  defaultController: 'index', // default controller name
  defaultAction: 'index', // default action name
  prefix: [], // url prefix
  suffix: ['.html'], // url suffix
  enableDefaultRouter: true,
  optimizeHomepageRouter: true,
  subdomainOffset: 2,
  subdomain: {}, // subdomain
  denyModules: [] // deny module, enable in multi module mode
};

/**
 * format Rule
 * @param {Array} rule
 */
const formatRule = rule => {
  const query = [];
  const match = pathToRegexp(rule[0], query);

  // [/match/, 'rest'] for simple restful router
  if (rule.length === 2 && rule[1].toUpperCase() === 'REST') {
    rule[2] = rule[1];
    rule[1] = null;
  }

  return {
    match,
    path: rule[1],
    method: rule[2] && rule[2].toUpperCase(),
    options: rule[3] || {},
    query
  };
};

/**
 * format routers
 * @param {Array|Object} routers
 */
const formatRouters = routers => {
  if (helper.isArray(routers)) {
    return routers.map(item => {
      if (item.rules) {
        item.match = pathToRegexp(item.match);
        item.rules = item.rules.map(rule => {
          return formatRule(rule);
        });
        return item;
      } else {
        return formatRule(item);
      }
    });
  }
  for (const m in routers) {
    if (routers[m].match) {
      routers[m].match = pathToRegexp(routers[m].match);
    }
    routers[m].rules = formatRouters(routers[m].rules);
  }

  return routers;
};

/**
 * parse router
 */
module.exports = function parseRouter(options, app) {
  options = Object.assign(defaultOptions, options);
  // set subdomain offset
  if (options.subdomainOffset) {
    app.subdomainOffset = options.subdomainOffset;
  }
  // change subdomain array to object
  // subdomain: ['admin', 'user'] => {admin: 'admin', user: 'ussr'}
  if (helper.isArray(options.subdomain)) {
    const subdomain = {};
    options.subdomain.forEach(item => {
      subdomain[item] = item;
    });
    options.subdomain = subdomain;
  }
  // format routers when app ready
  app.once('appReady', () => {
    app.routers = formatRouters(app.routers);
  });
  // format routers when routerChange event fired
  app.on('routerChange', routers => {
    app.routers = formatRouters(routers);
  });
  return function router(ctx, next) {
    const instance = new Router(ctx, next, options);
    return instance.run();
  };
};
