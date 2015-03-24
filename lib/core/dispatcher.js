/**
 * route dispather
 * @type {Object}
 */
var Dispatcher = module.exports = think.Class({
  /**
   * clean pathname, remove prefix & suffix
   * @return {} []
   */
  cleanPathname: function(){
    var pathname = this.http.pathname;
    var prefix = think.config('pathname_prefix');
    if (prefix && pathname.indexOf(prefix) === 0) {
      pathname = pathname.substr(prefix.length);
    }
    var suffix = this.config('pathname_suffix');
    if (suffix && pathname.substr(0 - suffix.length) === suffix) {
      pathname = pathname.substr(0, pathname.length - suffix.length);
    }
    this.http.pathname = pathname;
  },
  /**
   * parse pathname
   * @return {} []
   */
  parsePathname: function(){
    if (this.http.module) {
      return true;
    }
    var paths = this.http.pathname.split('/');
    //将group list变为小写
    var groupList = C('app_group_list');
    var group = '';
    if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
      group = paths.shift();
    }
    var controller = paths.shift();
    var action = paths.shift();
    //解析剩余path的参数
    if (paths.length) {
      for(var i = 0,length = Math.ceil(paths.length) / 2; i < length; i++){
        this.http.get[paths[i * 2]] = paths[i * 2 + 1] || '';
      }
    }
    this.http.module = Dispatcher.getGroup(group);
    this.http.controller = Dispatcher.getController(controller);
    this.http.action = Dispatcher.getAction(action);
  },
  /**
   * run
   * @return {} []
   */
  run: function(){
    var self = this;
    return this.hook('resource_check').then(function(){
      return self.cleanPathname();
    }).then(function(){
      return self.hook('path_info');
    }).then(function(){
      return self.hook('route_check');
    }).then(function(){
      return self.parsePathname();
    });
  }
});


Dispatcher.getModule = function(module){
  group = group || think.config('default_module');
  return group.toLowerCase();
}

/**
 * 检测Controller和Action是否合法的正则
 * @type {RegExp}
 */
var nameReg = /^[A-Za-z\_]\w*$/;
/**
 * 获取controller
 * @param  {[type]} controller [description]
 * @return {[type]}            [description]
 */
Dispatcher.getController = function(controller){
  'use strict';
  if (!controller) {
    return ucfirst(C('default_controller'));
  }else if (!nameReg.test(controller)) {
    return '';
  }
  return ucfirst(controller);
};
/**
 * 获取action
 * @param  {[type]} action [description]
 * @return {[type]}        [description]
 */
Dispatcher.getAction = function(action){
  'use strict';
  if (!action) {
    return C('default_action');
  }else if (!nameReg.test(action)) {
    return '';
  }
  return action;
};