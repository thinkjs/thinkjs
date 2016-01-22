'use strict';

import path from 'path';
import Base from './base.js';

/**
 * nunjucks template
 * @type {Class}
 */
export default class extends Base {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}             []
   */
  async run(templateFile, tVar, config){

    let options = this.parseConfig({
      autoescape: true,
      watch: false,
      noCache: false,
      throwOnUndefined: false
    }, config);
    
    let nunjucks = await think.npm('nunjucks');

    let env;
    if(options.root_path){
      //if templateFile not start with root_path, can not set root_path
      if(path.isAbsolute(templateFile) && templateFile.indexOf(options.root_path) !== 0){
        env = nunjucks.configure(options);
      }else{
        env = nunjucks.configure(options.root_path, options);
      }
    }else{
      env = nunjucks.configure(options);
    }

    env.addGlobal('think', think);
    env.addGlobal('JSON', JSON);
    env.addGlobal('eval', eval);

    this.prerender(options, nunjucks, env);

    let fn = think.promisify(nunjucks.render);
    return fn(templateFile, tVar);
  }
}