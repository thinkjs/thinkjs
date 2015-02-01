'use strict';
/**
 * exports
 * @param  {Object} options []
 * @return {void}         []
 */
module.exports = function(options){
  options = options || {};
  if (!options.APP_PATH) {
    throw new Error('APP_PATH must be set');
  }
  var argv = process.argv[2], i = 2;
  if (argv === 'online') {
    options.debug = false;
    i++;
  }else if (argv === 'debug') {
    options.debug = true;
    i++;
  }
  //for command line invork
  options.url = process.argv[i];
  require('./core/think.js');
  extend(think, options);
  think.loadAlias();
}