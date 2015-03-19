'use strict';

require('./core/think.js');

module.exports = think.Class({
  /**
   * init
   * @param  {Object} options [project options]
   * @return {}         []
   */
  init: function(options){
    options = options || {};
    think.extend(think, options);
    if (!think.APP_PATH) {
      throw new Error('options.APP_PATH must be set');
    }
    var argv = process.argv[2];
    var i = 2;
    //get app mode from argv
    if (argv === 'online') {
      think.debug = false;
      i++;
    }else if (argv === 'debug') {
      think.debug = true;
      i++;
    }
    argv = project[i];
    //get port or cli url from argv
    if (argv) {
      if (/^\d+$/.test(argv)) {
        think.port = argv;
      }else{
        think.mode = 'cli';
        think.url = argv;
      }
    }
    //app is mini mode
    if (think.isDir(think.APP_PATH + '/controller')) {
      think.mini = true;
    }
  },
  /**
   * check node or iojs env
   * @return {Boolean} []
   */
  checkEnv: function(){

  },
  loadAdapter: function(){

  },
  loadAlias: function(){

  },
  run: function(){
    this.checkEnv();
  }
})

think.module = function(){
  if (think.mini) {
    return [];
  }
  var modules = fs.readdirSync(think.APP_PATH);
  var denyModuleList = think._config.deny_module_list || [];
  if (denyModuleList.length === 0) {
    return modules;
  }
  return modules.filter(function(module){
    if (denyModuleList.indexOf(module) > -1) {
      return;
    }
    return module;
  })
}

/**
 * load hook
 * @return {Object} []
 */
think.loadHook = function(){
  var hook = think.extend({}, require(think.THINK_LIB_PATH + '/config/hook.js'));
  var common = think.mini ? '' : 'common/';
  var file = think.APP_PATH + '/' + common + 'config/hook.js';
  if (isFile(file)) {
    var data = think.safeRequire(file);
    var key, value;
    for(key in data){
      value = data[key];
      if (!(key in hook)) {
        hook[key] = data[key];
      }else if (isBoolean(data[0])) {
        var flag = value.shift();
        if (flag) {
          hook[key] = value;
        }else{
          hook[key] = value.concat(hook[key]);
        }
      }else{
        hook[key] = hook[key].concat(value);
      }
    }
  }
  think.hook = hook;
}