'use strict';

/**
 * swig template
 * @type {Class}
 */
let swig = require('swig');

module.exports = class extends think.adapter.template {
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @param  {Object} tVar         [data]
   * @return {String}              []
   */
  run(templateFile, tVar){
    swig.setDefaults(think.config('tpl.options'));
    let tpl = swig.compileFile(templateFile, {autoescape: false});
    return tpl(tVar);
  }
}