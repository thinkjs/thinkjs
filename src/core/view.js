'use strict';

/**
 * view class
 * @return {} []
 */
module.exports = class extends think.base {
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
  async display(templateFile, charset, contentType){
    try{
      await this.hook('view_init');
      await this.fetch(templateFile);
      await this.render(content, charset, contentType);
      await this.hook('view_end', content);
    }catch(err){
      await think.hook('app_error', this.http, err);
    }
    return think.defer().promise;
  }
  /**
   * render template content
   * @param  {String} content     [template content]
   * @param  {String} charset     [charset]
   * @param  {String} contentType [contentType]
   * @return {}             []
   */
  render(content = '', charset = this.http.config('encoding'), contentType = this.http.config('tpl.content_type')){
    this.http.type(contentType, charset);
    this.http.sendTime();
    return this.http.echo(content, charset);
  }
  /**
   * check template filepath exist
   * @param  {String} templateFile [template filepath]
   * @param  {Boolean} inView       []
   * @return {Promise}              []
   */
  checkTemplateExist(templateFile, inView){
    let cacheData = thinkCache(thinkCache.TEMPLATE);
    if (templateFile in cacheData) {
      return Promise.resolve(templateFile);
    }
    if (!inView && think.isFile(templateFile)) {
      //add template file to cache
      cacheData[templateFile] = true;
      return Promise.resolve(templateFile);
    }
    let err = new Error(think.message('TEMPLATE_NOT_EXIST', templateFile));
    return Promise.reject(err);
  }
  /**
   * fetch template file content
   * @param  {String} templateFile [template file]
   * @return {Promise}             []
   */
  async fetch(templateFile){
    let tVar = this.tVar, flag = false;
    if (!templateFile || templateFile[0] !== '/') {
      templateFile = await this.hook('view_template', templateFile);
      flag = true;
    }
    templateFile = await this.checkTemplateExist(templateFile, flag);
    let promises = Object.keys(tVar).map((key) => {
      if (!think.isPromise(tVar[key])) {
        return;
      }
      return tVar[key].then((data) => {
        tVar[key] = data;
      })
    })
    await Promise.all(promises);
    let content = await this.hook('view_parse', {
      'var': tVar,
      'file': templateFile
    })
    return this.hook('view_filter', content);
  }
}