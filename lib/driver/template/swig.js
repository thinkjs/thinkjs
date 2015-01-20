/**
 * swig模版引擎
 * @type {[type]}
 */
var swig = require('swig');

module.exports = {
  fetch: function(templateFile, tVar){
    'use strict';
    swig.setDefaults(C('tpl_engine_config'));
    var tpl = swig.compileFile(templateFile, {autoescape: false});
    var html = tpl(tVar);
    return html;
  }
};