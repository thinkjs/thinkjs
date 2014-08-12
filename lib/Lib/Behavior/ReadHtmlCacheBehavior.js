//获取模版文件
var WriteHtmlCacheBehavior = thinkRequire('WriteHtmlCacheBehavior');
var fs = require('fs');
/**
 * 读取HTML缓存
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
  'use strict';
  return {
    options:{
      'html_cache_on': false, //是否开启缓存
      'html_cache_timeout': 3600, //缓存时间
      'html_cache_rules': {}, //缓存规则
      'html_cache_path': '',
      'html_cache_file_callback': undefined, //生成缓存文件的回调函数
      'html_cache_file_suffix': '.html', //缓存文件扩展名
    },
    run: function(){
      if (!this.options.html_cache_on || isEmpty(this.options.html_cache_rules)) {
        return false;
      }
      var cacheTime = this.getCacheTime();
      if (cacheTime === false) {
        return false;
      }
      if (this.checkCacheTime(cacheTime)) {
        this.responseCacheContent();
        //return a pending promise
        return getDefer().promise;
      }
      return false;
    },
    /**
     * 返回缓存内容
     * @return {[type]} [description]
     */
    responseCacheContent: function(){
      var http = this.http;
      var fileStream = fs.createReadStream(this.options.html_cache_path + '/' + http.html_filename);
      http.setHeader('Content-Type', 'text/html');
      http.sendTime('Exec-Time');
      http.sendCookie();
      fileStream.pipe(http.res);
      fileStream.on('end', function(){
        http.end();
      });
    },
    /**
     * 获取缓存时间
     * @return {[type]} [description]
     */
    getCacheTime: function(){
      /**
       * rules数据格式
       * {
       *     'index:index': ['index_home', 1800, html_cache_callback]
       * }
       * @type {[type]}
       */
      var rules = this.options.html_cache_rules;
      var group = this.http.group.toLowerCase();
      var controller = this.http.controller.toLowerCase();
      var action = this.http.action;
      var list = [
        group + ':' + controller + ':' + action,
        controller + ':' + action,
        action,
        '*'
      ];
      var html = [];
      for(var i = 0, length = list.length, item; i < length; i++){
        item = list[i];
        if (item in rules) {
          html = rules[item];
          break;
        }
      }
      if (isEmpty(html)) {
        return false;
      }
      if (!isArray(html)) {
        html = [html];
      }
      var rule = html[0];
      //将cookie变量传递进去
      var cookiePars = {};
      for(var name in this.http.cookie){
        cookiePars['cookie.' + name] = this.http.cookie[name];
      }
      var pars = extend({}, this.http.get, cookiePars, {
        ':group': group,
        ':controller': controller,
        ':action': action
      });
      rule = rule.replace(/\{([\w\:]+)\}/g, function(a, name){
        return pars[name] || '';
      });
      var callback = html[2] || C('html_cache_file_callback') || this.getCacheFilename;
      var filename = callback(rule, this.http) + this.options.html_cache_file_suffix;
      //静态缓存文件名
      this.http.html_filename = filename;
      var cacheTime = html[1] || this.options.html_cache_timeout;
      return cacheTime;
    },
    /**
     * 
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    getCacheFilename: function(key){
      var value = md5(key);
      return value[0] + '/' + value[1] + '/' + value;
    },
    /**
     * [checkCacheTime description]
     * @return {[type]} [description]
     */
    checkCacheTime: function(cacheTime){
      var cacheFile = this.options.html_cache_path + '/' + this.http.html_filename;
      if (!isFile(cacheFile)) {
        return false;
      }
      var cacheFileMtime = fs.statSync(cacheFile).mtime.getTime();
      var tplFile = WriteHtmlCacheBehavior.getViewFile(this.http);
      if (tplFile) {
        if (!isFile(tplFile)) {
          return false;
        }
        var tplFileMtime = fs.statSync(tplFile).mtime.getTime();
        //模版文件有更新
        if (tplFileMtime > cacheFileMtime) {
          return false;
        }
      }
      if (Date.now() > (cacheFileMtime + cacheTime * 1000)) {
        return false;
      }
      return true;
    }
  };
});