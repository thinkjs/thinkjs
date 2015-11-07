'use strict';

import Base from './base.js';

/**
 * swig template
 * @type {Class}
 */
export default class extends Base {
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @param  {Object} tVar         [data]
   * @return {String}              []
   */
  async run(templateFile, tVar, config){
    
    let swig = await think.npm('swig');

    let conf = think.extend({
      autoescape: true
    }, think.config('view.options'), config && config.options);
    swig.setDefaults(conf);

    //pre render
    let prerender = config && config.prerender;
    prerender = prerender || think.config('view.prerender');
    if(think.isFunction(prerender)){
      prerender(swig);
    }

    let tpl = swig.compileFile(templateFile);
    return tpl(tVar);
  }
}