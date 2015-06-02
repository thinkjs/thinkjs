'use strict';

import path from 'path';
/**
 * find template file path
 * @param  {String}  
 * @return {Class}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @return {}              []
   */
  run(templateFile){
    let http = this.http;
    let {file_depr, file_ext, root_path} = this.config('tpl');
    let pathPrefix;
    //view root path is defined
    if(root_path){
      pathPrefix = path.normalize(root_path);
      if(think.mode !== think.mode_mini){
        pathPrefix += '/' + http.module;
      }
    }else{
      pathPrefix = think.getPath(http.module, think.dirname.view);
    }
    // this.display()
    if (!templateFile) {
      return pathPrefix + '/' + http.controller + file_depr + http.action + file_ext;
    }
    //replace : to /
    templateFile = templateFile.replace(/\:/g, '/');
    // this.display('detail')
    // this.display('index/detail')
    // this.display('admin/index/detail')
    // this.display('admin/index/detail.html')
    let paths = templateFile.split('/');
    let action = paths.pop();
    let controller = paths.pop() || http.controller;
    let module = paths.pop() || http.module;
    if (module !== http.module) {
      pathPrefix = think.getPath(module, think.dirname.view);
    }
    templateFile = pathPrefix + '/' + controller + file_depr + action;
    if (action.indexOf('.') === -1) {
      templateFile += file_ext;
    }
    return templateFile;
  }
}