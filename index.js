'use strict';
/**
 * think object, attribute & method will be in it.
 * @type {Object}
 */
global.think = {
  /**
   * thinkjs root path
   * @type {String}
   */
  THINK_PATH: __dirname,
  /**
   * config data
   * @type {Object}
   */
  config: {},
  /**
   * autoload data
   * @type {Object}
   */
  autoload: {},
  /**
   * resolve module
   * @param  {String} name [module name]
   * @return {String}      [module absolute path]
   */
  resolve: function(name){

  },
  /**
   * require module
   * @param  {String} name []
   * @return {}      []
   */
  require: function(name){
    if (!isString(name)) {
      return name;
    }
    if (name[0] !== '/') {
      name = this.resolve(name);
    }
    if (name) {
      var obj = require(name);
      if (isFunction(obj)) {
        //fix subclass can't get correct filename
        obj.prototype.__filename = name;
      }
      return obj;
    }
    return require(name);
  }
};
/**
 * think cache object, all cache data will be in it.
 * @type {Object}
 */
global.thinkCache = {};
/**
 * exports
 * @param  {Object} options []
 * @return {void}         []
 */
module.exports = function(options){
  options = options || {};
  for(var name in options){
    think[name] = options[name];
  }
  if (!think.APP_PATH) {
    throw new Error('APP_PATH must be set');
  }
  var argv = process.argv[2], i = 2;
  if (argv === 'online') {
    think.debug = false;
    i++;
  }else if (argv === 'debug') {
    think.debug = true;
    i++;
  }
  //for command line invork
  think.url = process.argv[i];

  require(think.THINK_PATH + '/lib/think.js').run();
  require(think.THINK_PATH + '/lib/app.js').run();
}