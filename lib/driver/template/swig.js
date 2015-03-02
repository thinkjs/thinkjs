'use strict';

/**
 * swig template
 * @type {Class}
 */
var swig = require('swig');

module.exports = think.template({
  run: function(templateFile, tVar){
    swig.setDefaults(C('tpl_engine_config'));
    var tpl = swig.compileFile(templateFile, {autoescape: false});
    return tpl(tVar);
  }
})