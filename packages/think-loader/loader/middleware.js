const path = require('path');
const helper = require('think-helper');
const assert = require('assert');

/**
 * check url matched
 */
function checkMatched(match, ctx){
  if(helper.isString(match)){
    return ctx.path.indexOf(match) === 0;
  }
  if(helper.isRegExp(match)){
    return match.test(ctx.path);
  }
  if(helper.isFunction(match)){
    return match(ctx);
  }
  throw new Error('match must be a String/RegExp/Function');
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
 * [handle, options, enable, match, ignore]
 * ]
 */
function parseMiddleware(middlewares = [], middlewarePkg = {}){
  return middlewares.map(item => {
    if(helper.isString(item)){
      return {handle: item};
    }
    //need support Array type? convert Array to object
    if(helper.isArray(item)){
      let data = {}, index = 0;
      data.handle = item[index++];
      ['options', 'enable', 'match', 'ignore'].forEach(it => {
        if(item[index] !== undefined){
          data[it] = item[index++];
        }
      });
      return data;
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
    assert(helper.isFunction(item.handle), 'handle must be a function');
    return item;
  }).map(item => {
    if(!item.match && !item.ignore){
      return item.handle;
    }
    // has match or ignore
    return (ctx, next) => {
      if(item.match && !checkMatched(item.match.ctx)){
        return next();
      }
      if(item.ignore && checkMatched(item.ignore, ctx)){
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
function getMiddlewareFiles(middlewarePath){
  let ret = {};
  helper.getdirFiles(middlewarePath).forEach(file => {
    if(!/\.(?:js|es)$/.test(file)){
      return;
    }
    let match = file.match(/(\w+)\.\w+$/);
    if(match && match[1]){
      ret[match[1]] = require(path.join(middlewarePath, file));
    }
  });
  return ret;
}

/**
 * load sys and app middlewares
 */
function loadMiddlewareFiles(appPath, isMultiModule, thinkPath){
  let sysMiddlewares = getMiddlewareFiles(path.join(thinkPath, 'lib/middleware'));
  let appMiddlewarePath = path.join(appPath, isMultiModule ? 'common/middleware' : 'middleware');
  let appMiddlewares = getMiddlewareFiles(appMiddlewarePath);
  let middlewares = Object.assign({}, sysMiddlewares, appMiddlewares);
  return middlewares;
}

function loader(appPath, thinkPath, modules){
  let filepath = '';
  if(modules.length){
    filepath = path.join(appPath, 'common/config/middleware.js');
  }else{
    filepath = path.join(appPath, 'config/middleware.js');
  }
  const middlewares = require(filepath);
  return parseMiddleware(middlewares, loadMiddlewareFiles(appPath, modules.length, thinkPath));
}

module.exports = loader;