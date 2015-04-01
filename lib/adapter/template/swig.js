'use strict';

/**
 * swig template
 * @type {Class}
 */
var swig;

module.exports = think.adapter({
  run: function(templateFile, tVar){
    if (!swig) {
      swig = require('swig');
    }
    swig.setDefaults(think.config('tpl.options'));
    var tpl = swig.compileFile(templateFile, {autoescape: false});
    return tpl(tVar);
  }
})