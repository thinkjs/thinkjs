'use strict';

/**
 * view class
 * @return {} []
 */
module.exports = think.Class({
  /**
   * init method
   * @param  {Object} http []
   * @return {}      []
   */
  init: function(http){
    this.http = http;
    this.tVar = {};
  },
  /**
   * assign
   * @param  {String} name  []
   * @param  {mixed} value []
   * @return {}       []
   */
  assign: function(name, value){
    if (name === undefined) {
      return this.tVar;
    }else if (value === undefined) {
      if (think.isString(name)) {
        return this.tVar[name];
      }else{
        for(var key in name){
          this.tVar[key] = name[key];
        }
      }
    }
    this.tVar[name] = value;
  },
  /**
   * output template file
   * @param  {String} templateFile [template filepath]
   * @param  {String} charset      [content encoding]
   * @param  {String} contentType  [content type]
   * @return {Promise}              []
   */
  display: function(templateFile, charset, contentType){
    var self = this;
    return this.hook('view_init').then(function(){
      return self.fetch(templateFile);
    }).then(function(content){
      return self.render(content, charset, contentType);
    }).then(function(content){
      return self.hook('view_end', content);
    }).then(function(){
      return self.http.end();
    }).catch(function(err){
      think.log(err);
      return self.http.end();
    }).then(function(){
      return Promise.defer().promise;
    })
  },
  /**
   * render template content
   * @param  {String} content     [template content]
   * @param  {String} charset     [charset]
   * @param  {String} contentType [contentType]
   * @return {}             []
   */
  render: function(content, charset, contentType){
    this.http.type(contentType || this.http.config('tpl.content_type'), charset);
    this.http.sendTime();
    return this.http.echo(content || '', charset || this.http.config('encoding'));
  },
  /**
   * check template filepath exist
   * @param  {String} templateFile [template filepath]
   * @param  {Boolean} inView       []
   * @return {Promise}              []
   */
  checkTemplateExist: function(templateFile, inView){
    var cacheData = thinkCache(thinkCache.TEMPLATE);
    if (templateFile in cacheData) {
      return Promise.resolve(templateFile);
    }
    if (!inView && think.isFile(templateFile)) {
      //add template file to cache
      cacheData[templateFile] = true;
      return Promise.resolve(templateFile);
    }
    var err = new Error(think.message('TEMPLATE_NOT_EXIST', templateFile));
    return Promise.reject(err);
  },
  /**
   * fetch template file content
   * @param  {String} templateFile [template file]
   * @return {Promise}             []
   */
  fetch: function(templateFile){
    var self = this;
    var promise;
    var tVar = this.tVar;
    if (!templateFile || templateFile[0] !== '/') {
      promise = this.hook('view_template', templateFile).then(function(file){
        return self.checkTemplateExist(file, true);
      });
    }else{
      promise = this.checkTemplateExist(templateFile);
    }
    return promise.then(function(file){
      templateFile = file;
      var promises = Object.keys(tVar).map(function(key){
        if (!think.isPromise(tVar[key])) {
          return;
        }
        return tVar[key].then(function(data){
          tVar[key] = data;
        })
      })
      return Promise.all(promises);
    }).then(function(){
      return self.hook('view_parse', {
        'var': tVar,
        'file': templateFile
      });
    }).then(function(content){
      return self.hook('view_filter', content);
    });
  }
});