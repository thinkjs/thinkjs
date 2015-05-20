'use strict';
/**
 * find template file path
 * @param  {Array}  
 * @return {}
 */
module.exports = class extends think.middleware.base {
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @return {}              []
   */
  run(templateFile){
    let http = this.http;
    let {file_depr, file_ext} = this.config('tpl');
    let pathPrefix = think.getPath(http.module, think.dirname.view) + '/';
    // this.display()
    if (!templateFile) {
      return pathPrefix + http.controller + file_depr + http.action + file_ext;
    }
    // this.display('detail')
    // this.display('index/detail')
    // this.display('admin/index/detail')
    // this.display('admin/index/detail.html')
    let paths = templateFile.split('/');
    let action = paths.pop();
    let controller = paths.pop() || http.controller;
    let module = paths.pop() || http.module;
    if (module !== http.module) {
      pathPrefix = think.getPath(module, think.dirname.view) + '/';
    }
    templateFile = pathPrefix + controller + file_depr + action;
    if (action.indexOf('.') === -1) {
      templateFile += file_ext;
    }
    return templateFile;
  }
}