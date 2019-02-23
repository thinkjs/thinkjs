'use strict';

import path from 'path';
/**
 * find template file path
 * @param  {String}  
 * @return {Class}
 */
export default class extends think.middleware.base {
  /**
   * get path prefix
   * @return {String} []
   */
  getPathPrefix(module){
    let pathPrefix, http = this.http, prefix = '';
    let {root_path} = this.options;
    let theme = http.theme();
    let lang = http._langAsViewPath && http.lang();
    
    module = module || http.module;
    
    //support locale
    if(lang){
      prefix += think.sep + lang;
    }
    //support theme
    if(theme){
      prefix += think.sep + theme;
    }

    //view root path is defined
    if(root_path){
      pathPrefix = path.normalize(root_path);
      if(think.mode === think.mode_module){
        pathPrefix += prefix + think.sep + module;
      }
    }else{
      pathPrefix = think.getPath(module, think.dirname.view, prefix);
    }

    return pathPrefix;
  }
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @return {}              []
   */
  run(options){
    if(!think.isObject(options)){
      options = think.extend({
        templateFile: options
      }, this.config('view'));
    }
    this.options = options;

    let templateFile = options.templateFile;
    //is absolute file path
    if(templateFile && path.isAbsolute(templateFile)){
      return templateFile;
    }
    let http = this.http;
    let {file_depr, file_ext} = options;
    let pathPrefix = this.getPathPrefix();
    let controller = http.controller.replace(/\//g, think.sep);

    //if file_depr is /, replace to think.sep, avoid error on windows
    if(file_depr === '/'){
      file_depr = think.sep;
    }

    // this.display()
    if (!templateFile) {
      return pathPrefix + think.sep + controller + file_depr + http.action + file_ext;
    }
    //replace : to /
    templateFile = templateFile.replace(/\:/g, '/');

    // this.display('detail')
    // this.display('index/detail')
    // this.display('admin/index/detail')
    // this.display('admin/index/detail.html')
    let paths = templateFile.split('/');
    let length = paths.length;
    let action = paths[length - 1];

    let module;
    if(length === 2){
      controller = paths[0];
    }else if(length > 2){
      let index = think.module.indexOf(paths[0]) > -1 ? 1 : 0;
      if(index){
        module = paths[0];
      }
      let newController = paths.slice(index, length - 1).join(think.sep);
      if(newController){
        controller = newController;
      }
    }

    if (module && module !== http.module) {
      pathPrefix = this.getPathPrefix(module);
    }

    templateFile = pathPrefix + think.sep + controller + file_depr + action;
    if (action.indexOf('.') === -1) {
      templateFile += file_ext;
    }
    return templateFile;
  }
}