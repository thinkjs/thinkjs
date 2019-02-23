'use strict';

import path from 'path';

/**
 * view class
 * @return {} []
 */
export default class extends think.http.base {
  /**
   * init method
   * @param  {Object} http []
   * @return {}      []
   */
  init(http){
    super.init(http);
    this.tVar = {};
  }
  /**
   * assign
   * @param  {String} name  []
   * @param  {mixed} value []
   * @return {}       []
   */
  assign(name, value){
    if (name === undefined) {
      return this.tVar;
    }else if (value === undefined) {
      if (think.isString(name)) {
        return this.tVar[name];
      }else{
        for(let key in name){
          this.tVar[key] = name[key];
        }
      }
    }else{
      this.tVar[name] = value;
    }
  }
  /**
   * output template file
   * @param  {String} templateFile [template filepath]
   * @param  {String} charset      [content encoding]
   * @param  {String} contentType  [content type]
   * @return {Promise}              []
   */
  async display(templateFile, charset, contentType, config){
    if(think.isObject(charset)){
      config = charset;
      charset = '';
    }else if(think.isObject(contentType)){
      config = contentType;
      contentType = '';
    }
    try{
      await this.hook('view_before');
      let content = await this.fetch(templateFile, undefined, config);
      await this.render(content, charset, contentType);
      await this.hook('view_after', content);
    }catch(err){
      this.http.error = err;
      await think.statusAction(500, this.http, true);
    }
    return think.prevent();
  }
  /**
   * render template content
   * @param  {String} content     [template content]
   * @param  {String} charset     [charset]
   * @param  {String} contentType [contentType]
   * @return {}             []
   */
  render(content = '', charset = this.http.config('encoding'), contentType = this.http.config('view.content_type')){
    this.http.type(contentType, charset);
    return this.http.end(content, charset);
  }
  /**
   * check template filepath exist
   * @param  {String} templateFile [template filepath]
   * @param  {Boolean} inView       []
   * @return {Promise}              []
   */
  checkTemplateExist(templateFile){
    let cacheData = thinkData.template;
    if (templateFile in cacheData) {
      return true;
    }
    if (think.isFile(templateFile)) {
      //add template file to cache
      cacheData[templateFile] = true;
      return true;
    }
    return false;
  }
  /**
   * fetch template file content
   * @param  {String} templateFile [template file]
   * @return {Promise}             []
   */
  async fetch(templateFile, data, config){
    let tVar = data && think.isObject(data) ? data : this.tVar;
    config = think.extend({
      templateFile: templateFile
    }, this.config('view'), config);

    if (!templateFile || !path.isAbsolute(templateFile)) {
      templateFile = await this.hook('view_template', config);
    }

    if(!this.checkTemplateExist(templateFile)){
      let err = new Error(think.locale('TEMPLATE_NOT_EXIST', templateFile));
      return think.reject(err);
    }
    
    let promises = Object.keys(tVar).map((key) => {
      if (!think.isPromise(tVar[key])) {
        return;
      }
      return tVar[key].then((data) => {
        tVar[key] = data;
      });
    });
    await Promise.all(promises);

    const data4ViewParse = {
      'var': tVar,
      'file': templateFile,
      'config': config
    };
    let content = await this.hook('view_parse', data4ViewParse);
    if (data4ViewParse === content) {
      content = '';
    }

    return this.hook('view_filter', content);
  }
}