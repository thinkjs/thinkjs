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

    let options = this.parseConfig({
      autoescape: true
    }, config);
    let swig = await think.npm('swig');

    swig.setDefaults(options);
    this.prerender(options, swig);

    let tpl = swig.compileFile(templateFile);
    return tpl(tVar);
  }
}