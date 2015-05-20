'use strict';

let fs = require('fs');
/**
 * read html cache
 * @param  {} )
 * @return {}     []
 */
module.exports = class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    let cache = this.cache = this.config('html_cache');
    if (!cache.on || think.isEmpty(cache.rules)) {
      return;
    }
    let cacheTime = this.getCacheTime();
    if (cacheTime === false) {
      return;
    }
    if (!this.isCacheExpired(cacheTime)) {
      this.responseCacheContent();
      return think.prevent();
    }
  }
  /**
   * repsonse cache content
   * @return {} []
   */
  responseCacheContent(){
    let http = this.http;
    let fileStream = fs.createReadStream(this.cache.path + '/' + http.html_filename);
    http.setHeader('Content-Type', 'text/html');
    http.sendTime('Exec-Time');
    http.sendCookie();
    fileStream.pipe(http.res);
    fileStream.on('end', (http.end));
  }
  /**
   * get cache time
   * @return {Number} []
   */
  getCacheTime(){
    /**
     * rules data
     * {
     *     'index:index': ['index_home', 1800, html_cache_callback]
     * }
     * @type {}
     */
    let rules = this.cache.rules;
    let http = this.http;
    let group = http.module;
    let controller = http.controller;
    let action = http.action;
    let list = [
      `${group}/${controller}/${action}`,
      `${controller}/${action}`,
      `${action}`,
      '*'
    ];
    let html = [];
    for(let i = 0, length = list.length, item; i < length; i++){
      item = list[i];
      if (item in rules) {
        html = rules[item];
        break;
      }
    }
    if (think.isEmpty(html)) {
      return false;
    }
    if (!think.isArray(html)) {
      html = [html];
    }
    let rule = html[0];
    //将cookie变量传递进去
    let cookiePars = {};
    for(let name in http.cookie){
      cookiePars['cookie.' + name] = http.cookie[name];
    }
    let pars = think.extend({}, http.get, cookiePars, {
      ':group': group,
      ':controller': controller,
      ':action': action
    });
    rule = rule.replace(/\{([\w\:]+)\}/g, (a, name) => (pars[name] || ''));
    let callback = html[2] || this.cache.callback || this.getCacheFilename;
    let filename = callback(rule, this.http) + this.cache.file_ext;
    //set html cache filename, for write_html_cache middleware
    http.html_filename = filename;
    let cacheTime = html[1] || this.cache.timeout;
    return cacheTime;
  }
  /**
   * 
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  getCacheFilename(key){
    let value = think.md5(key);
    return `${value[0]}/${value[1]}/${value}`;
  }
  /**
   * get view file
   * @return {String} [cache file]
   */
  getViewFile(){
    let http = this.http;
    let key = `${http.module}/${http.controller}/${http.action}`;
    return thinkCache(thinkCache.VIEW, key);
  }
  /**
   * check cache is expired
   * @return {Boolean} []
   */
  isCacheExpired(cacheTime){
    let cacheFile = `${this.cache.path}/${this.http.html_filename}`;
    if (!think.isFile(cacheFile)) {
      return true;
    }
    let cacheFileMtime = fs.statSync(cacheFile).mtime.getTime();
    let tplFile = this.getViewFile();
    if (tplFile) {
      if (!think.isFile(tplFile)) {
        return true;
      }
      let tplFileMtime = fs.statSync(tplFile).mtime.getTime();
      if (tplFileMtime > cacheFileMtime) {
        return true;
      }
    }
    if (Date.now() > (cacheFileMtime + cacheTime * 1000)) {
      return true;
    }
    return false;
  }
}