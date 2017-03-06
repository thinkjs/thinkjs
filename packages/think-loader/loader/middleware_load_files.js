const path = require('path');
const getMiddlewareFiles = require('./middleware_get_files');


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
module.exports = loadMiddlewareFiles;