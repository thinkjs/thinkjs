/**
 * view
 * @return {[type]} [description]
 */
module.exports = Class(function(){
  'use strict';
  return {
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
        this.tVar = extend(this.tVar, name);
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
     * 渲染模版
     * @param  {[type]} content     [description]
     * @param  {[type]} charset     [description]
     * @param  {[type]} contentType [description]
     * @return {[type]}             [description]
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
     * 获取模版文件内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    fetch: function(templateFile){
      var self = this;
      var promise = getPromise(templateFile);
      if (!templateFile || !isFile(templateFile)) {
        promise = tag('view_template', this.http, templateFile).then(function(file){
          return isFile(file) ? file : getPromise(new Error("can't find template file"), true);
        });
      }
      return promise.then(function(templateFile){
        return tag('view_parse', self.http, {
          'var': self.tVar,
          'file': templateFile
        });
      }).then(function(content){
        return tag('view_filter', self.http, content);
      });
    }
  };
});