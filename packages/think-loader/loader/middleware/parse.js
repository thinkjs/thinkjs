const helper = require('think-helper');
const assert = require('assert');
var pathToRegexp = require('path-to-regexp');
/**
 * check url matched
 */
function createRegexp(match){
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
function parseMiddleware(middlewares = [], middlewarePkg = {}){
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
    item.handle = item.handle(item.options || {});
    // handle also be a function
    assert(helper.isFunction(item.handle), 'handle must return a function');
    return item;
  }).map(item => {
    if(!item.match && !item.ignore){
      return item.handle;
    }

    // create regexp here for better performance
    var matchRegexp = createRegexp(item.match);
    var ignoreRegexp = createRegexp(item.ignore);

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

module.exports = parseMiddleware;