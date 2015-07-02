'use strict';

/**
 * swig template
 * @type {Class}
 */

export default class extends think.adapter.template {
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @param  {Object} tVar         [data]
   * @return {String}              []
   */
  async run(templateFile, tVar){
    let swig = await think.npm('swig');
    swig.setDefaults(think.config('tpl.options'));
    let tpl = swig.compileFile(templateFile, {autoescape: false});
    return tpl(tVar);
  }
}