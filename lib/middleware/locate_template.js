'use strict';
/**
 * find template file path
 * @param  {Array}  
 * @return {}
 */
module.exports = think.middleware({
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @return {}              []
   */
  run: function(templateFile){
    var http = this.http, pathPrefix = think.APP_PATH + '/';
    var depr = this.config('file_depr');
    var ext = this.config('file_ext');
    if (think.mini) {
      pathPrefix +=  think.dirname.view + '/';
    }else{
      pathPrefix += http.module + '/' + think.dirname.view + '/';
    }
    // this.display()
    if (!templateFile) {
      return pathPrefix + http.controller + depr + http.action + ext;
    }
    // this.display('detail')
    // this.display('group/detail')
    // this.display('admin/group/detail')
    // this.display('admin/group/detail.html')
    if (templateFile.indexOf('.') === -1) {
      templateFile += ext;
    }
    var paths = templateFile.split('/');
    var action = paths.pop();
    var controller = paths.pop() || http.controller;
    var module = path.pop() || http.module;
    if (think.mini) {
      templateFile += pathPrefix;
    }else{
      templateFile += pathPrefix + module + '/' + think.dirname.view + '/';
    }
    templateFile += controller + depr + action;
    return templateFile;
  }
});