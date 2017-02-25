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

class RouterParser {
  constructor(ctx, next, options){
    this.ctx = ctx;
    this.next = next;
    this.options = options;
  }
  run(){
    return this.next();
  }
}

module.exports = function parseRouter(options){
  options = Object.assign({}, defaultOptions, options);
  return (ctx, next) => {
    let instance = new RouterParser(ctx, next, options);
    return instance.run();
  } 
};