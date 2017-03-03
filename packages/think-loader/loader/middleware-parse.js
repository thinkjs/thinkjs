const helper = require('think-helper');
const assert = require('assert');
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
    assert(helper.isFunction(item.handle), 'handle must return a function');

    return item;
  });
}

module.exports = parseMiddleware;