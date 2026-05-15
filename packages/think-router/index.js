const Router = require('./router.js');
const helper = require('think-helper');
const pathToRegexp = require('path-to-regexp');

/**
 * default options
 */
const defaultOptions = {
  defaultModule: 'home',
  defaultController: 'index',
  defaultAction: 'index',
  prefix: [],
  suffix: ['.html'],
  enableDefaultRouter: true,
  optimizeHomepageRouter: true,
  subdomainOffset: 2,
  subdomain: {},
  denyModules: []
};

/**
 * format Rule
 */
const formatRule = rule => {
  const query = [];
  const match = pathToRegexp(rule[0], query);

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
 */
const formatRouters = routers => {
  if (helper.isArray(routers)) {
    return routers.map(item => {
      if (item.isFormatted) return item;
      if (item.rules) {
        item.match = pathToRegexp(item.match);
        item.rules = item.rules.map(rule => {
          return formatRule(rule);
        });
      } else {
        item = formatRule(item);
      }
      item.isFormatted = 1;
      return item;
    });
  }
  for (const m in routers) {
    if (routers[m].isFormatted) continue;
    if (routers[m].match) {
      routers[m].match = pathToRegexp(routers[m].match);
    }
    routers[m].rules = formatRouters(routers[m].rules);
    routers[m].isFormatted = 1;
  }

  return routers;
};

/**
 * parse router
 */
module.exports = function parseRouter(options, app) {
  options = Object.assign(defaultOptions, options);
  if (options.subdomainOffset) {
    app.subdomainOffset = options.subdomainOffset;
  }
  if (helper.isArray(options.subdomain)) {
    const subdomain = {};
    options.subdomain.forEach(item => {
      subdomain[item] = item;
    });
    options.subdomain = subdomain;
  }

  app.on('routerChange', routers => {
    app.routers = formatRouters(routers);
  });

  app.once('appReady', () => {
    app.routers = formatRouters(app.routers);
  });

  return function router(ctx, next) {
    const instance = new Router(ctx, next, options);
    return instance.run();
  };
};
