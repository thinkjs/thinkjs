'use strict';

import Base from './base.js';

/**
 * ejs template
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

    let ejs = await think.npm('ejs');

    let conf = think.extend({
      filename: templateFile,
      cache: true
    }, think.config('view.options'), config && config.options);

    //pre render
    let prerender = config && config.prerender;
    prerender = prerender || think.config('view.prerender');
    if(think.isFunction(prerender)){
      prerender(ejs);
    }

    let content = await this.getContent(templateFile);
    return ejs.compile(content, conf)(tVar);
  }
}
