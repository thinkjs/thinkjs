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
  constructor(http){
    super(http);
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
    }
    this.tVar[name] = value;
  }
  /**
   * output template file
   * @param  {String} templateFile [template filepath]
   * @param  {String} charset      [content encoding]
   * @param  {String} contentType  [content type]
   * @return {Promise}              []
   */
  display(templateFile, charset, contentType){
    return this.hook('view_init').then(() => {
      return this.fetch(templateFile);
    }).then((content) => {
      return this.render(content, charset, contentType);
    }).then((content) => {
      return this.hook('view_end', content);
    }).catch((err) => {
      return think.error(err, this.http);
    }).then(() => {
      this.http.end();
      return think.defer().promise;
    })
  }
  /**
   * render template content
   * @param  {String} content     [template content]
   * @param  {String} charset     [charset]
   * @param  {String} contentType [contentType]
   * @return {}             []
   */
  render(content, charset, contentType){
    this.http.type(contentType || this.http.config('tpl.content_type'), charset);
    this.http.sendTime();
    return this.http.echo(content || '', charset || this.http.config('encoding'));
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
  fetch(templateFile){
    let promise;
    let tVar = this.tVar;
    if (!templateFile || templateFile[0] !== '/') {
      promise = this.hook('view_template', templateFile).then((file) => {
        return this.checkTemplateExist(file, true);
      });
    }else{
      promise = this.checkTemplateExist(templateFile);
    }
    return promise.then((file) => {
      templateFile = file;
      let promises = Object.keys(tVar).map((key) => {
        if (!think.isPromise(tVar[key])) {
          return;
        }
        return tVar[key].then((data) => {
          tVar[key] = data;
        })
      })
      return Promise.all(promises);
    }).then(() => {
      return this.hook('view_parse', {
        'var': tVar,
        'file': templateFile
      });
    }).then((content) => {
      return this.hook('view_filter', content);
    });
  }
}