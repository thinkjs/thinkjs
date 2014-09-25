/**
 * swig
 * http://paularmstrong.github.io/swig/
 * @type {[type]}
 */
var swig = require('swig');

module.exports = {
  fetch: function(templateFile, tVar){
    'use strict';
    var content = getFileContent(templateFile);
    var conf = extend({
      filename: templateFile,
      cache: true
    }, C('tpl_engine_config'));
    return  swig.compile(content, conf)(tVar);     
  }
};