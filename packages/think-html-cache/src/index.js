'use strict';

import fs from 'fs';

/**
 * html cache
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  async run(content){

    if(!this.http.isGet()){
      return;
    }

    let config = this.config('html_cache');
    if(!config || !config.on || think.isEmpty(config.rules)){
      return content;
    }

    this.config = this.mergeConfig({
      type: 'file',
      adapter: {
        file: {
          path: think.getPath('common', 'runtime') + '/html_cache'
        }
      }
    }, config);

    //get store instance
    let Store = think.adapter('store', this.config.type);
    this.store = new Store(this.config);

    if(!content){
      return this.readHtmlCache();
    }
    if(this.http.html_cache_key){
      await this.writeHtmlCache(content);
    }
    return content;
  }
  /**
   * write html cache
   * @param  {String} content []
   * @return {Promise}         []
   */
  writeHtmlCache(content){
    this.viewFile();

    let cacheKey = this.http.html_cache_key;
    let time = Date.now() + this.http.html_cache_time * 1000;
    time = ('000000000000' + time).slice(-20);
    return this.store.set(cacheKey, time + content);
  }
  /**
   * read html cache
   * @return {} []
   */
  readHtmlCache(){
    let rule = this.getMatchRule();
    if(!rule){
      return;
    }
    let http = this.http;
    let cacheKey = this.getCacheKey(rule);
    let cacheTime = rule[1] || this.config.timeout;
    http.html_cache_time = parseInt(cacheTime) || 0;
    let content = this.getCacheContent(cacheKey, cacheTime);
    if(content){
      http.header('Content-Type', 'text/html');
      http.header('X-Cache', `HIT (${cacheKey})`);
      http.end(content);
      return think.prevent();
    }
  }
  /**
   * get cache time
   * @return {Number} []
   */
  getMatchRule(){
    /**
     * rules data
     * {
     *     'index/index': ['index_home', 1800, html_cache_callback]
     * }
     * @type {}
     */
    let rules = this.config.rules;
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
    return html;
  }
  /**
   * 
   * @param  {String} key []
   * @return {String}     [cache file name]
   */
  getCacheKey(rule){
    //cookie value
    let cookiePars = {};
    let http = this.http;
    for(let name in http._cookie){
      cookiePars['cookie.' + name] = http._cookie[name];
    }
    let pars = think.extend({}, http._get, cookiePars, {
      ':module': http.module,
      ':controller': http.controller,
      ':action': http.action
    });
    let key = rule[0].replace(/\{([\w\:\.]+)\}/g, (a, name) => (pars[name] || ''));
    let callback = rule[2] || this.config.callback || (key => think.md5(key));
    let cacheKey = callback(key, this.http);
    this.http.html_cache_key = cacheKey;
    return cacheKey;
  }
  /**
   * get view file
   * @return {String} [cache file]
   */
  viewFile(){
    let http = this.http;
    let tplFile = http.tpl_file;
    let key = `${http.module}/${http.controller}/${http.action}`;
    if(tplFile){
      thinkCache(thinkCache.VIEW, key, tplFile);
      return;
    }
    return thinkCache(thinkCache.VIEW, key);
  }
  /**
   * get cache content
   * @return {} []
   */
  async getCacheContent(cacheKey, cacheTime){

    let content = await this.store.get(cacheKey);
    if(!content){
      return;
    }

    //expire time is error
    let expire = parseInt(content.slice(0, 20), 10) || 0;
    if(!expire){
      return;
    }

    //content is empty
    content = content.slice(20);
    if(!content){
      return;
    }

    //view file is not exist
    let viewFile = this.viewFile();
    if(!viewFile || !think.isFile(viewFile)){
      return;
    }

    //if cache is expired
    if(cacheTime && expire < (Date.now() + cacheTime * 1000)){
      return;
    }

    let mtime = fs.statSync(viewFile).mtime.getTime();
    //template file is update after cache content
    if(expire < (mtime + cacheTime * 1000)){
      return;
    }

    return content;
  }
}