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
      if(item.match && !checkMatched(item.match, ctx)){
        return next();
      }
      if(item.ignore && checkMatched(item.ignore, ctx)){
        return next();
      }
      return item.handle(ctx, next);
    }
  })
}

module.exports = parseMiddleware;