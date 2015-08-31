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
    let lang = http.lang();
    
    module = module || http.module;
    
    //support locale
    if(lang){
      prefix += `/${lang}`;
    }
    //support theme
    if(theme){
      prefix += `/${theme}`;
    }

    //view root path is defined
    if(root_path){
      pathPrefix = path.normalize(root_path);
      if(think.mode !== think.mode_mini){
        pathPrefix += prefix + '/' + module;
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
      }, this.config('tpl'));
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
    
    // this.display()
    if (!templateFile) {
      return path.normalize(pathPrefix + '/' + http.controller + file_depr + http.action + file_ext);
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
      pathPrefix = this.getPathPrefix(module);
    }

    templateFile = pathPrefix + '/' + controller + file_depr + action;
    if (action.indexOf('.') === -1) {
      templateFile += file_ext;
    }
    return path.normalize(templateFile);
  }
}