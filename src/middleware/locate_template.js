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
    var http = this.http;
    var depr = this.config('tpl.file_depr');
    var ext = this.config('tpl.file_ext');
    var pathPrefix = think.getPath(http.module, think.dirname.view) + '/';
    // this.display()
    if (!templateFile) {
      return pathPrefix + http.controller + depr + http.action + ext;
    }
    // this.display('detail')
    // this.display('group/detail')
    // this.display('admin/group/detail')
    // this.display('admin/group/detail.html')
    var paths = templateFile.split('/');
    var action = paths.pop();
    var controller = paths.pop() || http.controller;
    var module = paths.pop() || http.module;
    if (module !== http.module) {
      pathPrefix = think.getPath(module, think.dirname.view) + '/';
    }
    templateFile = pathPrefix + controller + depr + action;
    if (action.indexOf('.') === -1) {
      templateFile += ext;
    }
    return templateFile;
  }
});