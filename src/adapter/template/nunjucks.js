'use strict';

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
    
    let nunjucks = await think.npm('nunjucks');
    
    let conf = think.extend({
      autoescape: false,
      watch: false,
      noCache: false,
      throwOnUndefined: false
    }, think.config('view.options'), config && config.options);

    let env = nunjucks.configure(think.ROOT_PATH, conf);

    //pre render
    let prerender = config && config.prerender;
    prerender = prerender || think.config('view.prerender');
    if(think.isFunction(prerender)){
      prerender(nunjucks, env);
    }

    return nunjucks.render(templateFile, tVar);
  }
}