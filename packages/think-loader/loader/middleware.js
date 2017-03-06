const path = require('path');
const helper = require('think-helper');
const interopRequire = require('../util.js').interopRequire;
const parseMiddleware = require('./middleware_parse');
const loadMiddlewareFiles = require('./middleware_load_files');


function loader(appPath, thinkPath, modules){
  let filepath = '';
  if(modules.length){
    filepath = path.join(appPath, 'common/config/middleware.js');
  }else{
    filepath = path.join(appPath, 'config/middleware.js');
  }
  if(!helper.isFile(filepath)){
    return [];
  }
  const middlewares = interopRequire(filepath);
  return parseMiddleware(middlewares, loadMiddlewareFiles(appPath, modules.length, thinkPath));
}

module.exports = loader;