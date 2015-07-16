'use strict';

import fs from 'fs';
/**
 * read html cache
 * @param  {} )
 * @return {}     []
 */
export default class extends think.middleware.base {
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
    if (this.isCacheExpired(cacheTime)) {
      return;
    }
    this.responseCacheContent();
    return think.prevent();
  }
  /**
   * repsonse cache content
   * @return {} []
   */
  responseCacheContent(){
    let http = this.http;
    let fileStream = fs.createReadStream(this.cache.path + '/' + http.html_filename);
    http.header('Content-Type', 'text/html');
    http.cookie(true);
    fileStream.pipe(http.res);
    fileStream.on('end', () => http.end());
  }
  /**
   * get cache time
   * @return {Number} []
   */
  getCacheTime(){
    /**
     * rules data
     * {
     *     'index/index': ['index_home', 1800, html_cache_callback]
     * }
     * @type {}
     */
    let rules = this.cache.rules;
    let http = this.http;
    let module = http.module;
    let controller = http.controller;
    let action = http.action;
    let list = [
      `${module}/${controller}/${action}`,
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
    if(think.isFunction(html[1])){
      html[2] = html[1];
      html[1] = 0;
    }
    let rule = html[0];
    //cookie value
    let cookiePars = {};
    for(let name in http._cookie){
      cookiePars['cookie.' + name] = http._cookie[name];
    }
    let pars = think.extend({}, http._get, cookiePars, {
      ':module': module,
      ':controller': controller,
      ':action': action
    });
    rule = rule.replace(/\{([\w\:\.]+)\}/g, (a, name) => (pars[name] || ''));
    let callback = html[2] || this.cache.callback || this.getCacheFilename;
    let filename = callback(rule, this.http) + this.cache.file_ext;
    //set html cache filename, for write_html_cache middleware
    http.html_filename = filename;
    let cacheTime = html[1] || this.cache.timeout;
    return cacheTime;
  }
  /**
   * 
   * @param  {String} key []
   * @return {String}     [cache file name]
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
    if(cacheTime === false){
      return true;
    }
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