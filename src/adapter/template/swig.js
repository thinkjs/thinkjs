'use strict';

/**
 * swig template
 * @type {Class}
 */
var swig = require('swig');

module.exports = think.adapter({
  run: function(templateFile, tVar){
    swig.setDefaults(think.config('tpl.options'));
    var tpl = swig.compileFile(templateFile, {autoescape: false});
    return tpl(tVar);
  }
})