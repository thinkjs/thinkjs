/**
 * swig模版引擎
 * @type {[type]}
 */
var swig = require('swig');

module.exports = {
  fetch: function(templateFile, tVar){
    'use strict';
    var tpl = swig.compileFile(templateFile, {autoescape: false});
    var html = tpl(tVar);
    return html;
  }
};