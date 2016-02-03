'use strict';

import fs from 'fs';

/**
 * template base class
 * @type {Class}
 */
export default class extends think.adapter.base {
  /**
   * merge config
   * @param  {Object} defaultConf []
   * @param  {Object} extraConf   []
   * @return {}             []
   */
  parseConfig(defaultConf, extraConf){
    let config = think.parseConfig(think.extend({}, defaultConf, think.config('view'), extraConf));
    //compatibility with view.options
    if(!think.isEmpty(config.options)){
      think.log(`view.options is deprecated, use view.adapter.${config.type} instead`, 'WARNING');
      config = think.extend(config, config.options);
    }
    return config;
  }
  /**
   * pre render
   * @param  {Object}    config []
   * @param  {...[type]} args   []
   * @return {}           []
   */
  prerender(config = {}, ...args){
    if(think.isFunction(config.prerender)){
      config.prerender(...args);
    }
  }
  /**
   * get template file content
   * @return {} []
   */
  async getContent(file){
    let stat = await think.promisify(fs.stat, fs)(file);
    let mTime = stat.mtime.getTime();
    let fileCache = thinkCache(thinkCache.VIEW_CONTENT, file);
    if(fileCache && fileCache[0] >= mTime){
      return fileCache[1];
    }
    return think.await(`template_${file}`, () => {
      let fn = think.promisify(fs.readFile, fs);
      return fn(file, 'utf8');
    }).then(content => {
      //if content is empty, not cached
      if(!content){
        return content;
      }
      thinkCache(thinkCache.VIEW_CONTENT, file, [mTime, content]);
      return content;
    });
  }
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {promise}             []
   */
  run(templateFile){
    return this.getContent(templateFile);
  }
}
