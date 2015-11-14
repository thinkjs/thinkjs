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
    let config = think.parseConfig(defaultConf, think.config('view'), extraConf);
    //compatibility with view.options
    if(!think.isEmpty(config.options)){
      think.log(colors => {
        return colors.yellow('[DEPRECATED]') + ` view.options is deprecated, use view.adapter.${config.type} instead`;
      });
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
  getContent(file){
    let mTime = fs.statSync(file).mtime.getTime();
    let fileCache = thinkCache(thinkCache.VIEW_CONTENT, file);
    if(fileCache && fileCache[0] >= mTime){
      return fileCache[1];
    }
    let content = fs.readFileSync(file, 'utf8');
    thinkCache(thinkCache.VIEW_CONTENT, file, [mTime, content]);
    return content;
    // let fn = think.promisify(fs.readFile, fs);
    // return fn(file, 'utf8');
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