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
  argv = process.argv[i];
  if (argv) {
    if (/^\d+$/.test(argv)) {
      options.port = argv;
    }else{
      options.mode = 'cli';
      options.url = argv;
    }
  }
  if (isDir(options.APP_PATH + '/controller')) {
    options.mini = true;
  }
  require('./core/think.js');
  extend(think, options);
  require('./core/app.js').run();
}