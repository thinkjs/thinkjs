const path = require('path');
const parseMiddleware = require('./middleware-parse');
const loadMiddlewareFiles = require('./middleware-load-files');

/**
 * get middlewares in middleware path
 * * [THINKJS_LIB_PATH]/lib/middleware
 * * [APP_PATH]/middleware or [APP_PATH]/common/middleware
 */
function loader(appPath, isMultiModule, thinkPath){
  let filepath = '';
  if(isMultiModule){
    filepath = path.join(appPath, 'common/config/middleware.js');
  }else{
    filepath = path.join(appPath, 'config/middleware.js');
  }
  const middlewares = require(filepath);
  return parseMiddleware(middlewares, loadMiddlewareFiles(appPath, isMultiModule, thinkPath));
}

module.exports = {load: loader};