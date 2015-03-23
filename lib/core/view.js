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
   * 给变量赋值
   * @param  {[type]} name  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  assign: function(name, value){
    if (name === undefined) {
      return this.tVar;
    }
    if (isString(name) && arguments.length === 1) {
      return this.tVar[name];
    }
    if (isObject(name)) {
      for(var key in name){
        this.tVar[key] = name[key];
      }
    }else{
      this.tVar[name] = value;
    }
  },
  /**
   * 输出模版文件内容
   * @param  {[type]} templateFile [description]
   * @param  {[type]} charset      [description]
   * @param  {[type]} contentType  [description]
   * @param  {[type]} content      [description]
   * @return {[type]}              [description]
   */
  display: function(templateFile, charset, contentType){
    var self = this;
    return tag('view_init', this.http).then(function(){
      return self.fetch(templateFile);
    }).then(function(content){
      return self.render(content, charset, contentType);
    }).then(function(content){
      return tag('view_end', self.http, content);
    }).then(function(){
      return self.http.end();
    }).catch(function(err){
      console.error(err.stack);
      return self.http.end();
    }).then(function(){
      return getDefer().promise;
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
    if (!this.http.cthIsSend) {
      charset = charset || C('encoding');
      contentType = contentType || C('tpl_content_type');
      this.http.setHeader('Content-Type', contentType + '; charset=' + charset);
    }
    if (C('show_exec_time')) {
      this.http.sendTime('Exec-Time');
    }
    return this.http.echo(content || '', charset || C('encoding'));
  },
  /**
   * fetch template file content
   * @param  {String} templateFile [template file]
   * @return {Promise}             []
   */
  fetch: function(templateFile){
    var self = this;
    var promise = Promise.resolve(templateFile);
    if (!templateFile || !think.isFile(templateFile)) {
      promise = this.hook('view_template', templateFile).then(function(file){
        if (think.isFile(file)) {
          return file;
        }
        var err = new Error("can't find template file `" + file + "`");
        return Promise.reject(err);
      });
    }
    return promise.then(function(templateFile){
      var tVar = self.tVar;
      var promises = Object.keys(tVar).map(function(key){
        if (!think.isPromise(tVar[key])) {
          return;
        }
        return tVar[key].then(function(data){
          tVar[key] = data;
        })
      })
      return Promise.all(promises).then(function(){
        return self.hook('view_parse', {
          'var': tVar,
          'file': templateFile
        });
      })
    }).then(function(content){
      return self.hook('view_filter', content);
    });
  }
});