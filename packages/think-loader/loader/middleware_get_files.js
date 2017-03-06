const path = require('path');
const helper = require('think-helper');
const interopRequire = require('./util.js').interopRequire;
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
      ret[match[1]] = interopRequire(path.join(middlewarePath, file));
    }
  });
  return ret;
}

module.exports = getMiddlewareFiles;