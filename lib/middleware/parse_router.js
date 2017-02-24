const helper = require('think-helper');
/**
 * default options
 */
const defaultOptions = {
  defaultModule: 'home',
  defaultController: 'index',
  defaultAction: 'index',
  denyModules: []
}

function parseRouter(options){
  options = Object.assign({}, defaultOptions, options);
  return (ctx, next) => {
    
  } 
}

module.exports = parseRouter;